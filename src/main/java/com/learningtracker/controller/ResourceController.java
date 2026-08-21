package com.learningtracker.controller;

import com.learningtracker.dto.ResourceRequest;
import com.learningtracker.entity.Resource;
import com.learningtracker.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public List<Resource> getAll(@RequestParam(required = false) Long topicId) {
        return topicId != null ? resourceService.getByTopic(topicId) : resourceService.getAll();
    }

    @GetMapping("/{id}")
    public Resource getById(@PathVariable Long id) {
        return resourceService.getById(id);
    }

    @PostMapping
    public ResponseEntity<Resource> create(@Valid @RequestBody ResourceRequest request) {
        return ResponseEntity.ok(resourceService.create(request));
    }

    @PutMapping("/{id}")
    public Resource update(@PathVariable Long id, @Valid @RequestBody ResourceRequest request) {
        return resourceService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/review")
    public Resource markReviewed(@PathVariable Long id) {
        return resourceService.markReviewed(id);
    }
}
