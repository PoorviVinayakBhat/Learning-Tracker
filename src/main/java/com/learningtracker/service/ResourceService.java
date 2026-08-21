package com.learningtracker.service;

import com.learningtracker.dto.ResourceRequest;
import com.learningtracker.entity.Resource;
import com.learningtracker.entity.Topic;
import com.learningtracker.entity.User;
import com.learningtracker.exception.ApiException;
import com.learningtracker.repository.ResourceRepository;
import com.learningtracker.repository.TopicRepository;
import com.learningtracker.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final TopicRepository topicRepository;

    public List<Resource> getAll() {
        return resourceRepository.findByUserId(SecurityUtils.currentUserId());
    }

    public List<Resource> getByTopic(Long topicId) {
        return resourceRepository.findByUserIdAndTopicId(SecurityUtils.currentUserId(), topicId);
    }

    public Resource getById(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ApiException("Resource not found", HttpStatus.NOT_FOUND));
        assertOwnership(resource);
        return resource;
    }

    public Resource create(ResourceRequest request) {
        User user = SecurityUtils.currentUser();
        Topic topic = topicRepository.findById(request.getTopicId())
                .orElseThrow(() -> new ApiException("Topic not found", HttpStatus.NOT_FOUND));

        Resource resource = Resource.builder()
                .title(request.getTitle())
                .type(request.getType())
                .sourceUrl(request.getSourceUrl())
                .rawContent(request.getRawContent())
                .status(request.getStatus() != null ? request.getStatus() : Resource.Status.NOT_STARTED)
                .topic(topic)
                .user(user)
                .retentionStrength(1.0)
                .build();

        return resourceRepository.save(resource);
    }

    public Resource update(Long id, ResourceRequest request) {
        Resource resource = getById(id);
        resource.setTitle(request.getTitle());
        resource.setType(request.getType());
        resource.setSourceUrl(request.getSourceUrl());
        if (request.getRawContent() != null) resource.setRawContent(request.getRawContent());
        if (request.getStatus() != null) resource.setStatus(request.getStatus());
        if (request.getTopicId() != null) {
            Topic topic = topicRepository.findById(request.getTopicId())
                    .orElseThrow(() -> new ApiException("Topic not found", HttpStatus.NOT_FOUND));
            resource.setTopic(topic);
        }
        return resourceRepository.save(resource);
    }

    public void delete(Long id) {
        Resource resource = getById(id);
        resourceRepository.delete(resource);
    }

    /** Marks a resource as reviewed "now" - boosts retention strength (spaced repetition). */
    public Resource markReviewed(Long id) {
        Resource resource = getById(id);
        resource.setLastReviewedAt(java.time.LocalDateTime.now());
        resource.setRetentionStrength(Math.min(10.0, resource.getRetentionStrength() + 0.5));
        return resourceRepository.save(resource);
    }

    private void assertOwnership(Resource resource) {
        if (!resource.getUser().getId().equals(SecurityUtils.currentUserId())) {
            throw new ApiException("Not authorized to access this resource", HttpStatus.FORBIDDEN);
        }
    }
}
