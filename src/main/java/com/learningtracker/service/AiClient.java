package com.learningtracker.service;

/**
 * Thin abstraction over whichever LLM provider is configured
 * (app.ai.provider / app.ai.base-url / app.ai.model in application.yml).
 * Keeping this as an interface means summarization, quiz generation,
 * the revision planner, and AI search can all stay provider-agnostic.
 */
public interface AiClient {

    /**
     * Sends a single prompt (with an optional system instruction) and returns
     * the raw text completion. Implementations handle provider-specific
     * request/response shapes.
     */
    String complete(String systemPrompt, String userPrompt);
}
