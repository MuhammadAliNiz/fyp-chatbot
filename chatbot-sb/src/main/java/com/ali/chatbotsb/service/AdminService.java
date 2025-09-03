package com.ali.chatbotsb.service;

import com.ali.chatbotsb.dto.response.DashboardStatsResponse;
import com.ali.chatbotsb.dto.response.VectorStoreTestResponse;
import com.ali.chatbotsb.dto.response.AuthDebugResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class AdminService {
    
    private final VectorStore vectorStore;
    
    /**
     * Get dashboard statistics
     */
    public DashboardStatsResponse getDashboardStats() {
        log.info("🔄 Fetching dashboard statistics");
        
        try {
            // You can expand this with actual statistics from your services
            Map<String, Object> systemMetrics = new HashMap<>();
            systemMetrics.put("uptime", "99.9%");
            systemMetrics.put("memoryUsage", "2.1 GB");
            systemMetrics.put("cpuUsage", "45%");
            systemMetrics.put("responseTime", "250ms");
            
            return DashboardStatsResponse.builder()
                    .vectorStoreStatus("operational")
                    .systemStatus("healthy")
                    .lastUpdate(LocalDateTime.now())
                    .totalDocuments(0) // TODO: Implement actual count from vector store
                    .totalUsers(0) // TODO: Implement actual count from user service
                    .activeUsers(0) // TODO: Implement actual count from user service
                    .totalVectorStoreSize(0L) // TODO: Implement actual size calculation
                    .systemMetrics(systemMetrics)
                    .build();
                    
        } catch (Exception e) {
            log.error("❌ Error fetching dashboard stats: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to fetch dashboard statistics", e);
        }
    }
    
    /**
     * Test VectorStore connection
     */
    public VectorStoreTestResponse testVectorStore() {
        log.info("🔄 Testing VectorStore connection");
        
        VectorStoreTestResponse.VectorStoreTestResponseBuilder responseBuilder = VectorStoreTestResponse.builder();
        Map<String, Object> additionalInfo = new HashMap<>();
        
        try {
            if (vectorStore != null) {
                responseBuilder.vectorStoreStatus("Connected");
                responseBuilder.vectorStoreClass(vectorStore.getClass().getSimpleName());
                
                // Try a simple operation
                try {
                    var searchResults = vectorStore.similaritySearch("test");
                    responseBuilder.searchTest("Success");
                    responseBuilder.documentCount(searchResults.size());
                    
                    additionalInfo.put("testQuery", "test");
                    additionalInfo.put("timestamp", LocalDateTime.now());
                    
                } catch (Exception e) {
                    log.warn("⚠️ VectorStore search test failed: {}", e.getMessage());
                    responseBuilder.searchTest("Failed: " + e.getMessage());
                }
            } else {
                responseBuilder.vectorStoreStatus("Not Available");
                responseBuilder.error("VectorStore bean is null");
            }
            
        } catch (Exception e) {
            log.error("❌ VectorStore test failed: {}", e.getMessage(), e);
            responseBuilder.error("VectorStore test failed: " + e.getMessage());
        }
        
        return responseBuilder.additionalInfo(additionalInfo).build();
    }
    
    /**
     * Get authentication debug information
     */
    public AuthDebugResponse getAuthDebugInfo(Authentication authentication) {
        log.info("🔄 Getting authentication debug information");
        
        AuthDebugResponse.AuthDebugResponseBuilder responseBuilder = AuthDebugResponse.builder();
        Map<String, Object> additionalInfo = new HashMap<>();
        
        if (authentication != null) {
            responseBuilder.name(authentication.getName());
            responseBuilder.authorities(authentication.getAuthorities().stream()
                    .map(grantedAuthority -> grantedAuthority.getAuthority())
                    .collect(Collectors.toList()));
            responseBuilder.isAuthenticated(authentication.isAuthenticated());
            responseBuilder.principal(authentication.getPrincipal().getClass().getSimpleName());
            
            additionalInfo.put("authenticationClass", authentication.getClass().getSimpleName());
            additionalInfo.put("timestamp", LocalDateTime.now());
            
        } else {
            responseBuilder.error("No authentication found");
            additionalInfo.put("message", "Authentication object is null");
        }
        
        return responseBuilder.additionalInfo(additionalInfo).build();
    }
}
