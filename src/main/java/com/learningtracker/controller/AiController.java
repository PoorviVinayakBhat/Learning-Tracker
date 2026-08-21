package com.learningtracker.controller;

import com.learningtracker.dto.QuizAnswerSubmission;
import com.learningtracker.entity.Quiz;
import com.learningtracker.entity.QuizAttempt;
import com.learningtracker.entity.Resource;
import com.learningtracker.service.QuizService;
import com.learningtracker.service.SummarizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final SummarizationService summarizationService;
    private final QuizService quizService;

    @PostMapping("/resources/{id}/summarize")
    public Resource summarize(@PathVariable Long id) {
        return summarizationService.summarize(id);
    }

    @PostMapping("/resources/{id}/quiz")
    public Quiz generateQuiz(@PathVariable Long id,
                              @RequestParam(defaultValue = "5") int numQuestions) {
        return quizService.generateQuiz(id, numQuestions);
    }

    @GetMapping("/resources/{id}/quizzes")
    public java.util.List<Quiz> getQuizzes(@PathVariable Long id) {
        return quizService.getByResource(id);
    }

    @PostMapping("/quizzes/{quizId}/submit")
    public QuizAttempt submitQuiz(@PathVariable Long quizId, @RequestBody QuizAnswerSubmission submission) {
        return quizService.submitAttempt(quizId, submission);
    }
}
