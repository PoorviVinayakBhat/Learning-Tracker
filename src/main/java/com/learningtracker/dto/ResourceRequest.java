package com.learningtracker.dto;

import com.learningtracker.entity.Resource;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ResourceRequest {
    @NotBlank
    private String title;

    @NotNull
    private Resource.ResourceType type;

    private String sourceUrl;
    private String rawContent;
    private Long topicId;
    private Resource.Status status;
}
