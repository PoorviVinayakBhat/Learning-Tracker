package com.learningtracker.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningtracker.entity.*;
import com.learningtracker.exception.ApiException;
import com.learningtracker.repository.QuizAttemptRepository;
import com.learningtracker.repository.QuizRepository;
import com.learningtracker.repository.ResourceRepository;
import com.learningtracker.dto.QuizAnswerSubmission;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final AiClient aiClient;
    private final ResourceRepository resourceRepository;
    private final QuizRepository quizRepository;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String SYSTEM_PROMPT = """
            You are a quiz-generation engine for a study app. Given study material, generate
            multiple-choice questions that test real understanding (not just recall of exact
            wording). Respond with ONLY valid JSON, no markdown fences, no commentary, in
            exactly this shape:
            {
              "questions": [
                {
                  "questionText": "...",
                  "optionA": "...",
                  "optionB": "...",
                  "optionC": "...",
                  "optionD": "...",
                  "correctOption": "A",
                  "explanation": "...",
                  "difficulty": "EASY" | "MEDIUM" | "HARD"
                }
              ]
            }
            """;

    public Quiz generateQuiz(Long resourceId, int numQuestions) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ApiException("Resource not found", HttpStatus.NOT_FOUND));

        String sourceText = resource.getAiSummary() != null && !resource.getAiSummary().isBlank()
                ? resource.getAiSummary()
                : resource.getRawContent();

        if (sourceText == null || sourceText.isBlank()) {
            throw new ApiException("Add content or generate a summary first", HttpStatus.BAD_REQUEST);
        }

        String userPrompt = "Generate " + numQuestions + " multiple-choice questions from this material:\n\n" + sourceText;
        String rawJson = aiClient.complete(SYSTEM_PROMPT, userPrompt);

        Quiz quiz = Quiz.builder()
                .title("Quiz: " + resource.getTitle())
                .resource(resource)
                .user(resource.getUser())
                .questions(new ArrayList<>())
                .build();

        try {
            String cleaned = rawJson.trim()
                    .replaceAll("^```json", "")
                    .replaceAll("^```", "")
                    .replaceAll("```$", "")
                    .trim();
            JsonNode root = objectMapper.readTree(cleaned);
            JsonNode questionsNode = root.path("questions");

            for (JsonNode q : questionsNode) {
                QuizQuestion question = QuizQuestion.builder()
                        .questionText(q.path("questionText").asText())
                        .optionA(q.path("optionA").asText())
                        .optionB(q.path("optionB").asText())
                        .optionC(q.path("optionC").asText())
                        .optionD(q.path("optionD").asText())
                        .correctOption(q.path("correctOption").asText())
                        .explanation(q.path("explanation").asText(""))
                        .difficulty(QuizQuestion.Difficulty.valueOf(
                                q.path("difficulty").asText("MEDIUM").toUpperCase()))
                        .quiz(quiz)
                        .build();
                quiz.getQuestions().add(question);
            }
        } catch (Exception e) {
            throw new ApiException("Failed to parse AI-generated quiz: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }

        if (quiz.getQuestions().isEmpty()) {
            throw new ApiException("AI did not return any questions, try again", HttpStatus.BAD_GATEWAY);
        }

        return quizRepository.save(quiz);
    }

    public QuizAttempt submitAttempt(Long quizId, QuizAnswerSubmission submission) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new ApiException("Quiz not found", HttpStatus.NOT_FOUND));

        Map<Long, String> answers = submission.getAnswers();
        int correct = 0;
        for (QuizQuestion question : quiz.getQuestions()) {
            String submitted = answers.get(question.getId());
            if (submitted != null && submitted.equalsIgnoreCase(question.getCorrectOption())) {
                correct++;
            }
        }

        int total = quiz.getQuestions().size();
        double scorePercent = total == 0 ? 0 : (correct * 100.0) / total;

        QuizAttempt attempt = QuizAttempt.builder()
                .quiz(quiz)
                .user(quiz.getUser())
                .totalQuestions(total)
                .correctAnswers(correct)
                .scorePercent(scorePercent)
                .build();
        attempt = quizAttemptRepository.save(attempt);

        // Feed the result back into the resource's mastery score and retention strength
        Resource resource = quiz.getResource();
        double newMastery = (resource.getMasteryScore() * 0.5) + (scorePercent * 0.5);
        resource.setMasteryScore(newMastery);
        resource.setLastReviewedAt(java.time.LocalDateTime.now());
        double delta = scorePercent >= 70 ? 0.75 : -0.5;
        resource.setRetentionStrength(Math.max(0.5, Math.min(10.0, resource.getRetentionStrength() + delta)));
        resourceRepository.save(resource);

        return attempt;
    }

    public List<Quiz> getByResource(Long resourceId) {
        return quizRepository.findByResourceId(resourceId);
    }
}
