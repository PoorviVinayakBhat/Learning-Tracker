package com.learningtracker.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DashboardResponse {
    private long totalResources;
    private long completedResources;
    private long inProgressResources;
    private long totalTopics;
    private long totalQuizzesTaken;
    private double averageQuizScore;
    private double overallRetentionPercent;
}
