package com.learningtracker.service;

import com.learningtracker.dto.DecayRadarResponse;
import com.learningtracker.entity.Resource;
import com.learningtracker.entity.Topic;
import com.learningtracker.repository.ResourceRepository;
import com.learningtracker.repository.TopicRepository;
import com.learningtracker.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * KNOWLEDGE DECAY RADAR - the app's signature feature.
 *
 * Models how much of what you've learned you're likely to still remember,
 * using an Ebbinghaus-style forgetting curve:
 *
 *      R(t) = e^(-t / S)
 *
 * where t = days since the resource was last reviewed/quizzed, and
 * S = "retentionStrength" (a per-resource memory-strength score that grows
 * every time you review the material or ace a quiz on it, and shrinks when
 * you do poorly). Each review effectively "flattens the curve".
 *
 * The radar aggregates R(t) per Topic so the frontend can render a spider/
 * radar chart: each topic is an axis, and the value is how much of that
 * subject is estimated to still be retained right now. It also surfaces
 * the resources decaying fastest, so the user knows exactly what to revise.
 */
@Service
@RequiredArgsConstructor
public class DecayRadarService {

    private final ResourceRepository resourceRepository;
    private final TopicRepository topicRepository;

    public DecayRadarResponse getRadar() {
        Long userId = SecurityUtils.currentUserId();
        List<Topic> topics = topicRepository.findByUserId(userId);
        List<Resource> resources = resourceRepository.findByUserId(userId);

        Map<Long, List<Resource>> byTopic = resources.stream()
                .filter(r -> r.getTopic() != null)
                .collect(Collectors.groupingBy(r -> r.getTopic().getId()));

        List<DecayRadarResponse.TopicDecay> topicDecays = new ArrayList<>();
        for (Topic topic : topics) {
            List<Resource> topicResources = byTopic.getOrDefault(topic.getId(), List.of());
            double avgRetention = topicResources.isEmpty() ? 0 :
                    topicResources.stream()
                            .mapToDouble(this::retentionPercent)
                            .average()
                            .orElse(0);

            topicDecays.add(DecayRadarResponse.TopicDecay.builder()
                    .topicId(topic.getId())
                    .topicName(topic.getName())
                    .averageRetentionPercent(round(avgRetention))
                    .resourceCount(topicResources.size())
                    .build());
        }

        List<DecayRadarResponse.ResourceDecay> atRisk = resources.stream()
                .filter(r -> r.getLastReviewedAt() != null || r.getStatus() != Resource.Status.NOT_STARTED)
                .map(r -> DecayRadarResponse.ResourceDecay.builder()
                        .resourceId(r.getId())
                        .resourceTitle(r.getTitle())
                        .topicName(r.getTopic() != null ? r.getTopic().getName() : "Uncategorized")
                        .retentionPercent(round(retentionPercent(r)))
                        .lastReviewedAt(r.getLastReviewedAt())
                        .daysSinceReview(daysSince(r.getLastReviewedAt()))
                        .build())
                .sorted(Comparator.comparingDouble(DecayRadarResponse.ResourceDecay::getRetentionPercent))
                .limit(10)
                .collect(Collectors.toList());

        return DecayRadarResponse.builder()
                .topics(topicDecays)
                .mostAtRisk(atRisk)
                .build();
    }

    /** R(t) = e^(-t/S) as a 0-100 percentage. Never-reviewed resources default to a full curve from creation date. */
    private double retentionPercent(Resource resource) {
        LocalDateTime anchor = resource.getLastReviewedAt() != null
                ? resource.getLastReviewedAt()
                : resource.getCreatedAt();
        if (anchor == null) return 100.0;

        double t = Duration.between(anchor, LocalDateTime.now()).toHours() / 24.0;
        double s = Math.max(0.5, resource.getRetentionStrength());
        double retention = Math.exp(-t / (s * 3.5)); // 3.5-day base half-life scalar, tuned so S=1 ~ "review weekly"
        return Math.max(0, Math.min(100, retention * 100));
    }

    private int daysSince(LocalDateTime time) {
        if (time == null) return -1;
        return (int) Duration.between(time, LocalDateTime.now()).toDays();
    }

    private double round(double value) {
        return Math.round(value * 10.0) / 10.0;
    }
}
