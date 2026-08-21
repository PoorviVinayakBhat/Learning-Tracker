package com.learningtracker.repository;

import com.learningtracker.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByUserId(Long userId);
    List<Topic> findByUserIdAndPurpose(Long userId, Topic.Purpose purpose);
}
