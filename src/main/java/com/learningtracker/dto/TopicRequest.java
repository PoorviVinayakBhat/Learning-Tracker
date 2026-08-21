package com.learningtracker.dto;

import com.learningtracker.entity.Topic;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TopicRequest {
    @NotBlank
    private String name;
    private String description;
    private Topic.Purpose purpose;
    private LocalDateTime targetDate;
}
