package com.learningtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DecayRadarResponse {
    private List<TopicDecay> topics;
    private List<ResourceDecay> mostAtRisk; // resources needing review soonest

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class TopicDecay {
        private Long topicId;
        private String topicName;
        private double averageRetentionPercent; // 0-100, radar chart axis value
        private int resourceCount;
    }

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ResourceDecay {
        private Long resourceId;
        private String resourceTitle;
        private String topicName;
        private double retentionPercent;
        private LocalDateTime lastReviewedAt;
        private int daysSinceReview;
    }
}
