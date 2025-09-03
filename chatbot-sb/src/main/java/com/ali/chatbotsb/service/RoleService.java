package com.ali.chatbotsb.service;

import com.ali.chatbotsb.model.Role;
import com.ali.chatbotsb.model.User;
import com.ali.chatbotsb.repository.RoleRepository;
import com.ali.chatbotsb.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoleService {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public void initializeDefaultRoles() {
        // Create default roles if they don't exist
        for (Role.RoleType roleType : Role.RoleType.values()) {
            if (!roleRepository.existsByName(roleType)) {
                Role role = Role.builder()
                        .name(roleType)
                        .description(roleType.getDescription())
                        .build();
                roleRepository.save(role);
            }
        }
    }

    @Transactional
    public void assignRoleToUser(UUID userId, Role.RoleType roleType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleType));

        user.addRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void removeRoleFromUser(UUID userId, Role.RoleType roleType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleType));

        user.removeRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void assignMultipleRolesToUser(UUID userId, Set<Role.RoleType> roleTypes) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Set<Role> roles = roleRepository.findByNameIn(roleTypes);

        for (Role role : roles) {
            user.addRole(role);
        }

        userRepository.save(user);
    }

    public Role getDefaultUserRole() {
        return roleRepository.findByName(Role.RoleType.USER)
                .orElseThrow(() -> new RuntimeException("Default USER role not found"));
    }

    public Set<Role> getAllRoles() {
        return Set.copyOf(roleRepository.findAll());
    }

    @Transactional
    public void addRoleToUser(UUID userId, Role.RoleType roleType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new RuntimeException("Role not found: " + roleType));

        user.addRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void changeUserPassword(UUID userId, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }
}
