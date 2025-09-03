package com.ali.chatbotsb.controller;

import com.ali.chatbotsb.dto.ApiResponse;
import com.ali.chatbotsb.service.PdfIngestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pdf")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class PdfController {

    private final PdfIngestService pdfIngestService;

    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadPdf(@RequestParam("file") MultipartFile file) {
        log.info("PDF upload request for file: {}", file.getOriginalFilename());

        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }

        if (!file.getContentType().equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        try {
            File convFile = new File(System.getProperty("java.io.tmpdir") + "/" + file.getOriginalFilename());
            file.transferTo(convFile);

            pdfIngestService.ingestPdf(convFile);

            Map<String, Object> responseData = new HashMap<>();
            responseData.put("filename", file.getOriginalFilename());
            responseData.put("size", file.getSize());
            responseData.put("status", "ingested");

            // Clean up temporary file
            convFile.delete();

            return ResponseEntity.ok(ApiResponse.success("PDF uploaded and ingested successfully", responseData));

        } catch (Exception e) {
            log.error("Error processing PDF upload: ", e);
            throw new RuntimeException("Failed to process PDF file: " + e.getMessage(), e);
        }
    }

    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(ApiResponse.success("PDF service is operational", "Service is healthy"));
    }
}
