package com.ali.chatbotsb.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PdfUploadRequest {
    
    @NotNull(message = "File is required")
    private MultipartFile file;
    
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
    
    private String category;
}
