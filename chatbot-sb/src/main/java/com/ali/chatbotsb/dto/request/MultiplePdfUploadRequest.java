package com.ali.chatbotsb.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultiplePdfUploadRequest {
    
    @NotEmpty(message = "At least one file is required")
    private MultipartFile[] files;
    
    @Size(max = 255, message = "Description cannot exceed 255 characters")
    private String description;
    
    private String category;
}
