package com.learningtracker.dto;

import lombok.Data;

import java.util.Map;

@Data
public class QuizAnswerSubmission {
    // key = questionId, value = selected option ("A"/"B"/"C"/"D")
    private Map<Long, String> answers;
}
