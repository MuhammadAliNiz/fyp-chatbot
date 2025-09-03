package com.ali.chatbotsb.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.apache.tika.exception.TikaException;
import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.stereotype.Service;
import org.xml.sax.SAXException;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class PdfIngestService {

    private final VectorStore vectorStore;
    private final Tika tika = new Tika();

    public PdfIngestService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
        log.info("🔧 PdfIngestService initialized with VectorStore: {}", 
                vectorStore != null ? vectorStore.getClass().getSimpleName() : "NULL");
    }

    public int ingestPdf(File pdfFile) throws IOException, TikaException, SAXException {
        log.info("🔄 Starting PDF ingestion for file: {}", pdfFile.getName());
        log.info("📂 File path: {}", pdfFile.getAbsolutePath());
        log.info("📊 File size: {} bytes", pdfFile.length());
        log.info("📋 File exists: {}", pdfFile.exists());
        log.info("📖 File readable: {}", pdfFile.canRead());

        if (!pdfFile.exists()) {
            throw new IOException("PDF file does not exist: " + pdfFile.getAbsolutePath());
        }

        if (!pdfFile.canRead()) {
            throw new IOException("Cannot read PDF file: " + pdfFile.getAbsolutePath());
        }

        // 1. Extract text using Apache Tika
        log.info("🔤 Extracting text from PDF using Apache Tika...");
        String text;
        try (FileInputStream fis = new FileInputStream(pdfFile)) {
            text = tika.parseToString(fis);
            log.info("✅ Text extraction completed. Length: {} characters", text.length());
            
            if (text.trim().isEmpty()) {
                log.warn("⚠️ Extracted text is empty for file: {}", pdfFile.getName());
                throw new RuntimeException("PDF appears to be empty or contains no extractable text");
            }
            
            log.debug("📄 First 200 characters of extracted text: {}", 
                    text.length() > 200 ? text.substring(0, 200) + "..." : text);
        }

        // 2. Split text into chunks
        log.info("✂️ Splitting text into chunks (size: 1000 characters)...");
        List<String> chunks = splitIntoChunks(text, 1000);
        log.info("📦 Created {} chunks from the text", chunks.size());

        // 3. Create Document list with id + metadata
        log.info("📝 Creating documents with metadata...");
        AtomicInteger counter = new AtomicInteger(0);
        List<Document> docs = chunks.stream()
                .map(chunk -> {
                    Map<String, Object> metadata = new HashMap<>();
                    metadata.put("filename", pdfFile.getName());
                    metadata.put("chunk", counter.getAndIncrement());
                    metadata.put("ingestion_time", System.currentTimeMillis());

                    String docId = UUID.randomUUID().toString();
                    log.debug("📄 Created document {} for chunk {}", docId, metadata.get("chunk"));

                    return new Document(
                            docId,     // ✅ unique ID
                            chunk,     // ✅ content
                            metadata   // ✅ never null
                    );
                })
                .toList();

        log.info("📚 Created {} documents ready for vector storage", docs.size());

        // 4. Store documents in Pinecone via VectorStore
        log.info("🔄 Storing documents in vector database...");
        try {
            if (vectorStore == null) {
                throw new RuntimeException("VectorStore is null - not properly initialized");
            }
            
            vectorStore.add(docs);
            log.info("✅ Successfully stored {} documents in vector database", docs.size());
            
        } catch (Exception e) {
            log.error("❌ Failed to store documents in vector database: {}", e.getMessage(), e);
            throw new RuntimeException("Vector storage failed: " + e.getMessage(), e);
        }

        log.info("🎉 PDF ingestion completed successfully for: {}", pdfFile.getName());
        return docs.size(); // Return number of chunks created
    }

    private List<String> splitIntoChunks(String text, int chunkSize) {
        log.debug("✂️ Splitting text of {} characters into chunks of {} characters", text.length(), chunkSize);
        
        List<String> chunks = new ArrayList<>();
        int length = text.length();
        
        for (int i = 0; i < length; i += chunkSize) {
            String chunk = text.substring(i, Math.min(length, i + chunkSize));
            chunks.add(chunk);
            log.trace("📦 Created chunk {}: {} characters", chunks.size(), chunk.length());
        }
        
        log.debug("✅ Text splitting completed: {} chunks created", chunks.size());
        return chunks;
    }
}
