package com.ali.chatbotsb.service;

import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.document.Document;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class PineconeService {

    private final VectorStore vectorStore;

    public PineconeService(VectorStore vectorStore) {
        this.vectorStore = vectorStore;
    }

    // Store documents
    public void addDocuments() {
        List<Document> docs = List.of(
                new Document("1", "Spring AI makes AI integration easy", null),
                new Document("2", "Pinecone is a vector database for semantic search", null)
        );
        vectorStore.add(docs);
    }

    // Query documents
    public List<Document> search(String query) {
        return vectorStore.similaritySearch(query);
    }
}
