package com.learningtracker.service;

import com.learningtracker.dto.DashboardResponse;
import com.learningtracker.dto.DecayRadarResponse;
import com.learningtracker.entity.QuizAttempt;
import com.learningtracker.entity.Resource;
import com.learningtracker.repository.QuizAttemptRepository;
import com.learningtracker.repository.ResourceRepository;
import com.learningtracker.repository.TopicRepository;
import com.learningtracker.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ResourceRepository resourceRepository;
    private final TopicRepository topicRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final DecayRadarService decayRadarService;

    public DashboardResponse getDashboard() {
        Long userId = SecurityUtils.currentUserId();
        List<Resource> resources = resourceRepository.findByUserId(userId);
        List<QuizAttempt> attempts = quizAttemptRepository.findByUserIdOrderByAttemptedAtDesc(userId);

        long completed = resources.stream().filter(r -> r.getStatus() == Resource.Status.COMPLETED).count();
        long inProgress = resources.stream().filter(r -> r.getStatus() == Resource.Status.IN_PROGRESS).count();

        double avgScore = attempts.isEmpty() ? 0 :
                attempts.stream().mapToDouble(QuizAttempt::getScorePercent).average().orElse(0);

        DecayRadarResponse radar = decayRadarService.getRadar();
        double overallRetention = radar.getTopics().isEmpty() ? 0 :
                radar.getTopics().stream().mapToDouble(DecayRadarResponse.TopicDecay::getAverageRetentionPercent)
                        .average().orElse(0);

        return DashboardResponse.builder()
                .totalResources(resources.size())
                .completedResources(completed)
                .inProgressResources(inProgress)
                .totalTopics(topicRepository.findByUserId(userId).size())
                .totalQuizzesTaken(attempts.size())
                .averageQuizScore(Math.round(avgScore * 10.0) / 10.0)
                .overallRetentionPercent(Math.round(overallRetention * 10.0) / 10.0)
                .build();
    }
}
