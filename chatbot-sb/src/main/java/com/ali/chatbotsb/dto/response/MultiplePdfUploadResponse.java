package com.ali.chatbotsb.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MultiplePdfUploadResponse {
    
    private Integer totalFiles;
    private Integer successCount;
    private Integer failCount;
    private List<PdfUploadResponse> results;
    private String summary;
}
