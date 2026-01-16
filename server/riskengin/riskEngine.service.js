// src/services/riskEngine.service.js
const axios = require('axios');

// The URL of your running Spring Boot Service
const SPRING_BOOT_API = 'http://localhost:8081/api/risk/analyze';

exports.analyzeLoginRisk = async (userId, ipAddress, userAgent) => {
    try {
        console.log(`[RiskEngine] Requesting analysis for user: ${userId}`);

        const payload = {
            userId: userId.toString(), // Ensure string format
            ipAddress: ipAddress || '0.0.0.0',
            timestamp: Date.now(),
            userAgent: userAgent || 'Unknown',
            deviceId: 'dev_' + userId // Placeholder until we add Frontend fingerprinting
        };

        const response = await axios.post(SPRING_BOOT_API, payload);
        
        console.log(`[RiskEngine] Result: ${response.data.status} (Score: ${response.data.riskScore})`);
        return response.data;

    } catch (error) {
        console.error('[RiskEngine] Connection Failed:', error.message);
        // FAIL-SAFE: If Spring Boot is down, do we block or allow?
        // For security, strict systems BLOCK. For UX, some ALLOW.
        // Let's return a default "ALLOW" but log the error for now.
        return { status: 'ALLOW', riskScore: 0, reason: 'Risk Engine Unavailable' };
    }
};