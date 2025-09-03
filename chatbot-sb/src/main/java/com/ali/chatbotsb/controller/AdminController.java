package com.ali.chatbotsb.controller;

import com.ali.chatbotsb.dto.ApiResponse;
import com.ali.chatbotsb.dto.response.PdfUploadResponse;
import com.ali.chatbotsb.dto.response.MultiplePdfUploadResponse;
import com.ali.chatbotsb.dto.response.DashboardStatsResponse;
import com.ali.chatbotsb.dto.response.VectorStoreTestResponse;
import com.ali.chatbotsb.dto.response.AuthDebugResponse;
import com.ali.chatbotsb.service.AdminService;
import com.ali.chatbotsb.service.PdfUploadService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final PdfUploadService pdfUploadService;
    private final AdminService adminService;

    /**
     * Upload multiple PDF files for RAG database
     */
    @PostMapping("/pdf/upload")
    public ResponseEntity<ApiResponse<MultiplePdfUploadResponse>> uploadPdfs(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category) {
        
        log.info("🔄 Admin multiple PDF upload request received for {} files", files.length);
        
        try {
            MultiplePdfUploadResponse response = pdfUploadService.uploadMultiplePdfs(files, description, category);
            log.info("� Upload summary: {}", response.getSummary());
            
            return ResponseEntity.ok(ApiResponse.success(response.getSummary(), response));
            
        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid request: " + e.getMessage()));
                    
        } catch (Exception e) {
            log.error("❌ Unexpected error during multiple PDF upload: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    /**
     * Upload single PDF file for RAG database
     */
    @PostMapping("/pdf/upload-single")
    public ResponseEntity<ApiResponse<PdfUploadResponse>> uploadSinglePdf(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "category", required = false) String category) {
        
        log.info("🔄 Admin single PDF upload request received for: {}", file.getOriginalFilename());
        
        try {
            PdfUploadResponse response = pdfUploadService.uploadSinglePdf(file, description, category);
            
            if ("success".equals(response.getStatus())) {
                log.info("✅ Single PDF upload completed successfully");
                return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
            } else {
                log.warn("⚠️ Single PDF upload completed with errors");
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error(response.getMessage(), "UPLOAD_ERROR", response));
            }
            
        } catch (IllegalArgumentException e) {
            log.error("❌ Invalid request: {}", e.getMessage());
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid request: " + e.getMessage()));
                    
        } catch (Exception e) {
            log.error("❌ Unexpected error during single PDF upload: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    /**
     * Get admin dashboard statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        log.info("🔄 Fetching dashboard statistics");
        
        try {
            DashboardStatsResponse response = adminService.getDashboardStats();
            return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved successfully", response));
            
        } catch (Exception e) {
            log.error("❌ Error fetching dashboard stats: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch dashboard stats: " + e.getMessage()));
        }
    }

    /**
     * Health check for admin services
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> adminHealthCheck() {
        return ResponseEntity.ok(ApiResponse.success("Admin service is operational", "All systems operational"));
    }

    /**
     * Test endpoint to get users (temporary for debugging)
     */
    @GetMapping("/users-test")
    public ResponseEntity<ApiResponse<String>> getUsersTest() {
        return ResponseEntity.ok(ApiResponse.success("Users endpoint reachable", "Test successful"));
    }

    /**
     * Debug endpoint to check current user authorities
     */
    @GetMapping("/debug-auth")
    public ResponseEntity<ApiResponse<AuthDebugResponse>> debugAuth(Authentication authentication) {
        log.info("🔄 Getting authentication debug information");
        
        try {
            AuthDebugResponse response = adminService.getAuthDebugInfo(authentication);
            return ResponseEntity.ok(ApiResponse.success("Authentication debug info retrieved", response));
            
        } catch (Exception e) {
            log.error("❌ Error getting auth debug info: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to get auth debug info: " + e.getMessage()));
        }
    }

    /**
     * Test VectorStore connection
     */
    @GetMapping("/test-vectorstore")
    public ResponseEntity<ApiResponse<VectorStoreTestResponse>> testVectorStore() {
        log.info("🔄 Testing VectorStore connection");
        
        try {
            VectorStoreTestResponse response = adminService.testVectorStore();
            return ResponseEntity.ok(ApiResponse.success("VectorStore test completed", response));
            
        } catch (Exception e) {
            log.error("❌ Error testing VectorStore: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("VectorStore test failed: " + e.getMessage()));
        }
    }
}
