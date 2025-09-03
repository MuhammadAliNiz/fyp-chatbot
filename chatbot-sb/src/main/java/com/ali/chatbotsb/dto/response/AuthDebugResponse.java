package com.ali.chatbotsb.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthDebugResponse {
    
    private String name;
    private List<String> authorities;
    private Boolean isAuthenticated;
    private String principal;
    private String error;
    private Map<String, Object> additionalInfo;
}
