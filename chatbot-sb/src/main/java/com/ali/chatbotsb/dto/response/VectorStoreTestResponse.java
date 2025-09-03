package com.ali.chatbotsb.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VectorStoreTestResponse {
    
    private String vectorStoreStatus;
    private String vectorStoreClass;
    private String searchTest;
    private Integer documentCount;
    private String error;
    private Map<String, Object> additionalInfo;
}
