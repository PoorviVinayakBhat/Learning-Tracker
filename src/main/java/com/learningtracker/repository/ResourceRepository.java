package com.learningtracker.repository;

import com.learningtracker.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByUserId(Long userId);

    List<Resource> findByTopicId(Long topicId);

    List<Resource> findByUserIdAndTopicId(Long userId, Long topicId);

    List<Resource> findByUserIdAndStatus(Long userId, Resource.Status status);

    // Search title and raw content for a user's resources.
    @Query("""
                SELECT r FROM Resource r
                WHERE r.user.id = :userId
                AND (
                    LOWER(r.title) LIKE LOWER(CONCAT('%', :search, '%'))
                    OR LOWER(CAST(r.rawContent AS string)) LIKE LOWER(CONCAT('%', :search, '%'))
                )
            """)
    List<Resource> searchResources(
            @Param("userId") Long userId,
            @Param("search") String search);
}