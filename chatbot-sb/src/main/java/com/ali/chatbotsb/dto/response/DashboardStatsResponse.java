package com.ali.chatbotsb.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsResponse {
    
    private String vectorStoreStatus;
    private String systemStatus;
    private LocalDateTime lastUpdate;
    private Integer totalDocuments;
    private Integer totalUsers;
    private Integer activeUsers;
    private Long totalVectorStoreSize;
    private Map<String, Object> systemMetrics;
}
