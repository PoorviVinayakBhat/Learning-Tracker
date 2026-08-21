package com.learningtracker.controller;

import com.learningtracker.service.RevisionPlannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/revision-planner")
@RequiredArgsConstructor
public class RevisionPlannerController {

    private final RevisionPlannerService revisionPlannerService;

    @GetMapping("/today")
    public Map<String, String> getTodayPlan() {
        return Map.of("plan", revisionPlannerService.generateTodayPlan());
    }
}
