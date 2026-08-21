package com.learningtracker.service;

import com.learningtracker.entity.Resource;
import com.learningtracker.exception.ApiException;
import com.learningtracker.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SummarizationService {

    private final AiClient aiClient;
    private final ResourceRepository resourceRepository;

    private static final String SYSTEM_PROMPT = """
            You are a study assistant that writes clear, structured summaries of learning
            material (video transcripts, book chapters, course notes, articles). Produce a
            summary with:
            1. A 2-3 sentence overview
            2. Key concepts as bullet points
            3. Any formulas, definitions, or facts worth memorizing, clearly labeled
            Keep it concise and skimmable. Use markdown formatting.
            """;

    public Resource summarize(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ApiException("Resource not found", HttpStatus.NOT_FOUND));

        if (resource.getRawContent() == null || resource.getRawContent().isBlank()) {
            throw new ApiException("Add some notes/content to this resource before summarizing", HttpStatus.BAD_REQUEST);
        }

        String userPrompt = "Summarize the following learning material titled \"" + resource.getTitle() + "\":\n\n"
                + resource.getRawContent();

        String summary = aiClient.complete(SYSTEM_PROMPT, userPrompt);
        resource.setAiSummary(summary);
        return resourceRepository.save(resource);
    }
}
