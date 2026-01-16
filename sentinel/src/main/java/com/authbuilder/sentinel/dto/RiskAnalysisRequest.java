package com.authbuilder.sentinel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RiskAnalysisRequest {

    @NotBlank(message = "User ID is required")
    private String userId;

    @NotBlank(message = "IP Address is required")
    private String ipAddress;

    private String deviceId;   // Fingerprint from Frontend
    private String userAgent;  // Browser details
    private long timestamp;    // When the login happened

}
