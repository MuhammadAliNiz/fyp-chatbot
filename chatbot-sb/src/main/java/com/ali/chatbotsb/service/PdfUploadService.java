package com.ali.chatbotsb.service;

import com.ali.chatbotsb.dto.response.PdfUploadResponse;
import com.ali.chatbotsb.dto.response.MultiplePdfUploadResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class PdfUploadService {
    
    private final PdfIngestService pdfIngestService;
    
    /**
     * Upload and process a single PDF file
     */
    public PdfUploadResponse uploadSinglePdf(MultipartFile file, String description, String category) {
        log.info("🔄 Processing single PDF upload: {}", file.getOriginalFilename());
        
        validatePdfFile(file);
        
        try {
            String documentId = UUID.randomUUID().toString();
            File tempFile = createTempFile(file);
            
            log.info("🤖 Starting PDF ingestion for: {}", file.getOriginalFilename());
            int chunksCreated = pdfIngestService.ingestPdf(tempFile);
            log.info("✅ PDF ingestion completed. Chunks created: {}", chunksCreated);
            
            cleanupTempFile(tempFile);
            
            return PdfUploadResponse.builder()
                    .filename(file.getOriginalFilename())
                    .size(file.getSize())
                    .status("success")
                    .message("PDF uploaded and ingested successfully")
                    .chunksCreated(chunksCreated)
                    .uploadTime(LocalDateTime.now())
                    .documentId(documentId)
                    .build();
                    
        } catch (Exception e) {
            log.error("❌ Error processing PDF {}: {}", file.getOriginalFilename(), e.getMessage(), e);
            
            return PdfUploadResponse.builder()
                    .filename(file.getOriginalFilename())
                    .size(file.getSize())
                    .status("error")
                    .message("Processing failed: " + e.getMessage())
                    .uploadTime(LocalDateTime.now())
                    .build();
        }
    }
    
    /**
     * Upload and process multiple PDF files
     */
    public MultiplePdfUploadResponse uploadMultiplePdfs(MultipartFile[] files, String description, String category) {
        log.info("🔄 Processing multiple PDF uploads. Count: {}", files.length);
        
        if (files.length == 0) {
            throw new IllegalArgumentException("No files provided");
        }
        
        List<PdfUploadResponse> results = new ArrayList<>();
        int successCount = 0;
        int failCount = 0;
        
        for (MultipartFile file : files) {
            log.info("📁 Processing file: {}", file.getOriginalFilename());
            
            try {
                PdfUploadResponse result = uploadSinglePdf(file, description, category);
                results.add(result);
                
                if ("success".equals(result.getStatus())) {
                    successCount++;
                } else {
                    failCount++;
                }
                
            } catch (Exception e) {
                log.error("❌ Error processing file {}: {}", file.getOriginalFilename(), e.getMessage(), e);
                
                PdfUploadResponse errorResult = PdfUploadResponse.builder()
                        .filename(file.getOriginalFilename())
                        .size(file.getSize())
                        .status("error")
                        .message("Processing failed: " + e.getMessage())
                        .uploadTime(LocalDateTime.now())
                        .build();
                        
                results.add(errorResult);
                failCount++;
            }
        }
        
        String summary = String.format("Upload completed: %d successful, %d failed out of %d files", 
                                      successCount, failCount, files.length);
        
        return MultiplePdfUploadResponse.builder()
                .totalFiles(files.length)
                .successCount(successCount)
                .failCount(failCount)
                .results(results)
                .summary(summary)
                .build();
    }
    
    /**
     * Validate PDF file
     */
    private void validatePdfFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        
        if (!"application/pdf".equals(file.getContentType())) {
            throw new IllegalArgumentException("Only PDF files are allowed. Received: " + file.getContentType());
        }
        
        // Check file size (50MB limit)
        long maxSize = 50 * 1024 * 1024; // 50MB in bytes
        if (file.getSize() > maxSize) {
            throw new IllegalArgumentException("File size exceeds 50MB limit");
        }
    }
    
    /**
     * Create temporary file from MultipartFile
     */
    private File createTempFile(MultipartFile file) {
        try {
            log.info("💾 Creating temporary file for: {}", file.getOriginalFilename());
            
            String tempDir = System.getProperty("java.io.tmpdir");
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            File tempFile = new File(tempDir, fileName);
            
            file.transferTo(tempFile);
            log.info("✅ Temporary file created: {}", tempFile.getAbsolutePath());
            
            return tempFile;
            
        } catch (Exception e) {
            throw new RuntimeException("Failed to create temporary file: " + e.getMessage(), e);
        }
    }
    
    /**
     * Clean up temporary file
     */
    private void cleanupTempFile(File tempFile) {
        if (tempFile != null && tempFile.exists()) {
            if (tempFile.delete()) {
                log.info("🗑️ Temporary file cleaned up: {}", tempFile.getName());
            } else {
                log.warn("⚠️ Failed to delete temporary file: {}", tempFile.getName());
            }
        }
    }
}
