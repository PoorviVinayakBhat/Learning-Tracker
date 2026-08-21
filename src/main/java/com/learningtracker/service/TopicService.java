package com.learningtracker.service;

import com.learningtracker.dto.TopicRequest;
import com.learningtracker.entity.Topic;
import com.learningtracker.entity.User;
import com.learningtracker.exception.ApiException;
import com.learningtracker.repository.TopicRepository;
import com.learningtracker.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TopicService {

    private final TopicRepository topicRepository;

    public List<Topic> getAll() {
        return topicRepository.findByUserId(SecurityUtils.currentUserId());
    }

    public Topic getById(Long id) {
        Topic topic = topicRepository.findById(id)
                .orElseThrow(() -> new ApiException("Topic not found", HttpStatus.NOT_FOUND));
        assertOwnership(topic);
        return topic;
    }

    public Topic create(TopicRequest request) {
        User user = SecurityUtils.currentUser();
        Topic topic = Topic.builder()
                .name(request.getName())
                .description(request.getDescription())
                .purpose(request.getPurpose() != null ? request.getPurpose() : Topic.Purpose.GENERAL)
                .targetDate(request.getTargetDate())
                .user(user)
                .build();
        return topicRepository.save(topic);
    }

    public Topic update(Long id, TopicRequest request) {
        Topic topic = getById(id);
        topic.setName(request.getName());
        topic.setDescription(request.getDescription());
        if (request.getPurpose() != null) topic.setPurpose(request.getPurpose());
        topic.setTargetDate(request.getTargetDate());
        return topicRepository.save(topic);
    }

    public void delete(Long id) {
        Topic topic = getById(id);
        topicRepository.delete(topic);
    }

    private void assertOwnership(Topic topic) {
        if (!topic.getUser().getId().equals(SecurityUtils.currentUserId())) {
            throw new ApiException("Not authorized to access this topic", HttpStatus.FORBIDDEN);
        }
    }
}
