package com.learningtracker.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.learningtracker.exception.ApiException;
import com.learningtracker.service.AiClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Map;

/**
 * Default AiClient implementation, wired to the Anthropic Messages API.
 * Swap app.ai.base-url / app.ai.provider to point at an OpenAI-compatible
 * endpoint instead - only this class needs to change.
 */
@Service
public class AnthropicAiClient implements AiClient {

    private final WebClient webClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.ai.api-key}")
    private String apiKey;

    @Value("${app.ai.base-url}")
    private String baseUrl;

    @Value("${app.ai.model}")
    private String model;

    public AnthropicAiClient(WebClient.Builder builder) {
        this.webClient = builder.build();
    }

    @Override
    public String complete(String systemPrompt, String userPrompt) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ApiException(
                    "AI_API_KEY is not configured on the server. Set the AI_API_KEY environment variable.",
                    HttpStatus.SERVICE_UNAVAILABLE);
        }

        Map<String, Object> requestBody = Map.of(
                "model", model,
                "max_tokens", 2000,
                "system", systemPrompt,
                "messages", List.of(Map.of("role", "user", "content", userPrompt))
        );

        try {
            String rawResponse = webClient.post()
                    .uri(baseUrl)
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", "2023-06-01")
                    .header("content-type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .block();

            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode content = root.path("content");
            StringBuilder text = new StringBuilder();
            if (content.isArray()) {
                for (JsonNode block : content) {
                    if ("text".equals(block.path("type").asText())) {
                        text.append(block.path("text").asText());
                    }
                }
            }
            if (text.isEmpty()) {
                throw new ApiException("AI provider returned an unexpected response", HttpStatus.BAD_GATEWAY);
            }
            return text.toString();
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException("AI request failed: " + e.getMessage(), HttpStatus.BAD_GATEWAY);
        }
    }
}
