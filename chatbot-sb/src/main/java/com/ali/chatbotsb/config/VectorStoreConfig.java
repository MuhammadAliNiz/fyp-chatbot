package com.ali.chatbotsb.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;

import jakarta.annotation.PostConstruct;

@Configuration
@Slf4j
public class VectorStoreConfig {

    @Autowired(required = false)
    private VectorStore vectorStore;

    @PostConstruct
    public void logVectorStoreStatus() {
        if (vectorStore != null) {
            log.info("VectorStore bean found: {}", vectorStore.getClass().getSimpleName());
        } else {
            log.warn("No VectorStore bean found! Check Pinecone configuration.");
        }
    }
}
