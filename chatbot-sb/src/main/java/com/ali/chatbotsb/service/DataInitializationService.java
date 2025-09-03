package com.ali.chatbotsb.service;

import com.ali.chatbotsb.model.Role;
import com.ali.chatbotsb.model.User;
import com.ali.chatbotsb.repository.RoleRepository;
import com.ali.chatbotsb.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@RequiredArgsConstructor
public class DataInitializationService implements CommandLineRunner {

    private final RoleService roleService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Initialize roles first
        roleService.initializeDefaultRoles();
        
        // Initialize default admin user
        initializeDefaultAdmin();
    }

    private void initializeDefaultAdmin() {
        String adminEmail = "admin@chatbot.com";
        
        // Check if admin user already exists
        if (userRepository.findByEmail(adminEmail).isPresent()) {
            return;
        }

        try {
            // Get ADMIN and USER roles
            Role adminRole = roleRepository.findByName(Role.RoleType.ADMIN)
                    .orElseThrow(() -> new RuntimeException("ADMIN role not found"));
            Role userRole = roleRepository.findByName(Role.RoleType.USER)
                    .orElseThrow(() -> new RuntimeException("USER role not found"));

            // Create default admin user
            User adminUser = User.builder()
                    .name("System Administrator")
                    .email(adminEmail)
                    .password(passwordEncoder.encode("admin123")) // Default password
                    .roles(Set.of(adminRole, userRole)) // Admin users should also have USER role
                    .build();

            userRepository.save(adminUser);
            
        } catch (Exception e) {
            // Silently handle exception
        }
    }
}
