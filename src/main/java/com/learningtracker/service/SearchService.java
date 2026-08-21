package com.learningtracker.service;

import com.learningtracker.entity.Resource;
import com.learningtracker.repository.ResourceRepository;
import com.learningtracker.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Keyword search across the user's resources (title + notes). Kept as a thin,
 * swappable layer: this can later be upgraded to embeddings/vector search
 * without changing the controller contract.
 */
@Service
@RequiredArgsConstructor
public class SearchService {

    private final ResourceRepository resourceRepository;

    public List<Resource> search(String query) {
        Long userId = SecurityUtils.currentUserId();
        return resourceRepository.searchResources(userId, query);
    }
}
