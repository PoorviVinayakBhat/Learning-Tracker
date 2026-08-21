package com.learningtracker.controller;

import com.learningtracker.dto.DecayRadarResponse;
import com.learningtracker.service.DecayRadarService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/decay-radar")
@RequiredArgsConstructor
public class DecayRadarController {

    private final DecayRadarService decayRadarService;

    @GetMapping
    public DecayRadarResponse getRadar() {
        return decayRadarService.getRadar();
    }
}
