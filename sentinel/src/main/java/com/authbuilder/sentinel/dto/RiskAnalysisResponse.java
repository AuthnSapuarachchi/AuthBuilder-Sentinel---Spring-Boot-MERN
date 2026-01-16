package com.authbuilder.sentinel.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RiskAnalysisResponse {

    private String status;      // ALLOW, CHALLENGE, BLOCK
    private int riskScore;      // 0 to 100
    private String reason;      // "New Device", "Impossible Travel", etc.

}
