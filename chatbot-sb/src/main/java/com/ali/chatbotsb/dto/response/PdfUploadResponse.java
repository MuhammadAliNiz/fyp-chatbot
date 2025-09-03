package com.ali.chatbotsb.dto.response;

import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PdfUploadResponse {
    
    private String filename;
    private Long size;
    private String status;
    private String message;
    private Integer chunksCreated;
    private LocalDateTime uploadTime;
    private String documentId;
}
