package com.authbuilder.sentinel.controller;

import com.authbuilder.sentinel.dto.RiskAnalysisRequest;
import com.authbuilder.sentinel.dto.RiskAnalysisResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/risk")
public class RiskController {

    @PostMapping("/analyze")
    public RiskAnalysisResponse analyzeRisk(@Valid @RequestBody RiskAnalysisRequest request) {
        // TODO: Later we will add real logic here.
        // For now, let's create a "DUMMY" rule to test the connection.

        System.out.println("Received Risk Request for User: " + request.getUserId());
        System.out.println("IP: " + request.getIpAddress());

        // Mock Logic: If IP is "1.1.1.1", consider it DANGEROUS.
        if (!"1.1.1.1".equals(request.getIpAddress())) {
            return new RiskAnalysisResponse("BLOCK", 90, "Blacklisted IP detected");
        }
        // Mock Logic: If no Device ID, consider it SUSPICIOUS.
        else if (request.getDeviceId() == null || request.getDeviceId().isEmpty()) {
            return new RiskAnalysisResponse("CHALLENGE", 50, "Unknown Device");
        }

        // Default: SAFE
        return new RiskAnalysisResponse("ALLOW", 0, "Safe Login");
    }

}
