package com.learningtracker.service;

import com.learningtracker.dto.DecayRadarResponse;
import com.learningtracker.entity.Topic;
import com.learningtracker.entity.User;
import com.learningtracker.repository.TopicRepository;
import com.learningtracker.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;

/**
 * Turns the Knowledge Decay Radar + upcoming exam/interview target dates into
 * a prioritized, AI-written revision plan: what to revise today, and why.
 */
@Service
@RequiredArgsConstructor
public class RevisionPlannerService {

    private final AiClient aiClient;
    private final DecayRadarService decayRadarService;
    private final TopicRepository topicRepository;

    private static final String SYSTEM_PROMPT = """
            You are an AI study planner. Given a user's daily study time budget, a list of
            topics with their current retention percentage (lower = more forgotten, more
            urgent), and any upcoming exam/interview deadlines, produce a short, motivating,
            prioritized revision plan for TODAY. Use markdown with a bullet list. Be concrete:
            name the topics, suggest how many minutes on each, and explain briefly why
            (e.g. "retention has dropped to 40%, exam in 5 days"). Keep it under 200 words.
            """;

    public String generateTodayPlan() {
        User user = SecurityUtils.currentUser();
        DecayRadarResponse radar = decayRadarService.getRadar();
        List<Topic> topics = topicRepository.findByUserId(user.getId());

        StringBuilder context = new StringBuilder();
        context.append("Daily study budget: ").append(user.getDailyGoalMinutes()).append(" minutes.\n\n");
        context.append("Topics and current retention:\n");

        for (DecayRadarResponse.TopicDecay td : radar.getTopics()) {
            Optional<Topic> topicOpt = topics.stream().filter(t -> t.getId().equals(td.getTopicId())).findFirst();
            String deadlineInfo = "";
            if (topicOpt.isPresent() && topicOpt.get().getTargetDate() != null) {
                long daysLeft = ChronoUnit.DAYS.between(LocalDate.now(), topicOpt.get().getTargetDate().toLocalDate());
                deadlineInfo = " | " + topicOpt.get().getPurpose() + " in " + daysLeft + " day(s)";
            }
            context.append("- ").append(td.getTopicName())
                    .append(": ").append(td.getAverageRetentionPercent()).append("% retained")
                    .append(" (").append(td.getResourceCount()).append(" resources)")
                    .append(deadlineInfo)
                    .append("\n");
        }

        if (radar.getTopics().isEmpty()) {
            context.append("(No topics yet.)\n");
        }

        return aiClient.complete(SYSTEM_PROMPT, context.toString());
    }
}
