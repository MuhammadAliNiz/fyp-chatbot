package com.ali.chatbotsb.controller;

import com.ali.chatbotsb.dto.ApiResponse;
import com.ali.chatbotsb.dto.RoleDto;
import com.ali.chatbotsb.dto.UserRoleRequest;
import com.ali.chatbotsb.dto.ChatSessionDto;
import com.ali.chatbotsb.dto.UserDto;
import com.ali.chatbotsb.model.ChatSession;
import com.ali.chatbotsb.model.Role;
import com.ali.chatbotsb.model.User;
import com.ali.chatbotsb.repository.ChatSessionRepository;
import com.ali.chatbotsb.repository.UserRepository;
import com.ali.chatbotsb.service.RoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class UserManagementController {

    private final RoleService roleService;
    private final UserRepository userRepository;
    private final ChatSessionRepository chatSessionRepository;

    /**
     * Get all users with their roles
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserDto> userDtos = users.stream()
                .map(this::convertToUserDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Users retrieved successfully", userDtos));
    }

    /**
     * Get all available roles
     */
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<RoleDto>>> getAllRoles() {
        Set<Role> roles = roleService.getAllRoles();
        List<RoleDto> roleDtos = roles.stream()
                .map(role -> RoleDto.builder()
                        .id(role.getId())
                        .name(role.getName())
                        .description(role.getDescription())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Roles retrieved successfully", roleDtos));
    }

    /**
     * Get user statistics
     */
    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<Object>> getUserStatistics() {
        long totalUsers = userRepository.count();
        long totalChatSessions = chatSessionRepository.count();

        return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully",
                new Object() {
                    public final long totalUsers = UserManagementController.this.userRepository.count();
                    public final long totalChatSessions = UserManagementController.this.chatSessionRepository.count();
                }));
    }

    /**
     * Get specific user with roles
     */
    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<UserDto>> getUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(ApiResponse.success("User retrieved successfully", convertToUserDto(user)));
    }

    /**
     * Assign multiple roles to a user
     */
    @PostMapping("/assign-roles")
    public ResponseEntity<ApiResponse<UserDto>> assignRolesToUser(@Valid @RequestBody UserRoleRequest request) {
        roleService.assignMultipleRolesToUser(request.getUserId(), request.getRoles());

        User updatedUser = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(ApiResponse.success("Roles assigned successfully", convertToUserDto(updatedUser)));
    }

    /**
     * Add single role to user
     */
    @PostMapping("/{userId}/roles/{roleType}")
    public ResponseEntity<ApiResponse<UserDto>> addRoleToUser(
            @PathVariable UUID userId,
            @PathVariable Role.RoleType roleType) {

        roleService.assignRoleToUser(userId, roleType);

        User updatedUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(ApiResponse.success("Role added successfully", convertToUserDto(updatedUser)));
    }

    /**
     * Remove role from user
     */
    @DeleteMapping("/{userId}/roles/{roleType}")
    public ResponseEntity<ApiResponse<UserDto>> removeRoleFromUser(
            @PathVariable UUID userId,
            @PathVariable Role.RoleType roleType) {

        roleService.removeRoleFromUser(userId, roleType);

        User updatedUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return ResponseEntity.ok(ApiResponse.success("Role removed successfully", convertToUserDto(updatedUser)));
    }

    /**
     * Delete user account (Admin only)
     * Uses manual cascade deletion until database constraints are updated
     */
    @DeleteMapping("/{userId}")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if trying to delete admin user
        if (user.getEmail().equals("admin@chatbot.com")) {
            throw new RuntimeException("Cannot delete default admin user");
        }

        // Manual cascade deletion until database CASCADE DELETE is applied
        long chatSessionCount = chatSessionRepository.countByUserId(userId);
        
        if (chatSessionCount > 0) {
            // Delete all chat sessions for this user (this will cascade to delete chat messages)
            List<ChatSession> userChatSessions = chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
            chatSessionRepository.deleteAll(userChatSessions);
        }

        // Delete user
        userRepository.delete(user);

        return ResponseEntity.ok(ApiResponse.success("User and all associated data deleted successfully"));
    }

    /**
     * Enable/Disable user account
     */
    @PutMapping("/{userId}/status")
    public ResponseEntity<ApiResponse<UserDto>> toggleUserStatus(
            @PathVariable UUID userId,
            @RequestParam boolean enabled) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Prevent disabling admin user
        if (user.getEmail().equals("admin@chatbot.com") && !enabled) {
            throw new RuntimeException("Cannot disable default admin user");
        }

        user.setEnabled(enabled);
        userRepository.save(user);

        String action = enabled ? "enabled" : "disabled";

        return ResponseEntity.ok(ApiResponse.success("User " + action + " successfully", convertToUserDto(user)));
    }

    /**
     * Change user password (Admin only)
     */
    @PutMapping("/{userId}/password")
    public ResponseEntity<ApiResponse<Void>> changeUserPassword(
            @PathVariable UUID userId,
            @RequestParam String newPassword) {

        roleService.changeUserPassword(userId, newPassword);

        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    /**
     * Get user's chat history
     */
    @GetMapping("/{userId}/chat-history")
    public ResponseEntity<ApiResponse<List<ChatSessionDto>>> getUserChatHistory(@PathVariable UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<ChatSession> chatSessions = chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        List<ChatSessionDto> chatSessionDtos = chatSessions.stream()
                .map(this::convertToChatSessionDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.success("Chat history retrieved successfully", chatSessionDtos));
    }


    // Helper methods

    private UserDto convertToUserDto(User user) {
        Set<RoleDto> roleDtos = user.getRoles().stream()
                .map(role -> RoleDto.builder()
                        .id(role.getId())
                        .name(role.getName())
                        .build())
                .collect(Collectors.toSet());

        long chatSessionCount = chatSessionRepository.countByUserId(user.getId());

        return UserDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .enabled(user.isEnabled())
                .accountNonExpired(user.isAccountNonExpired())
                .accountNonLocked(user.isAccountNonLocked())
                .credentialsNonExpired(user.isCredentialsNonExpired())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .roles(roleDtos)
                .chatSessionCount(chatSessionCount)
                .build();
    }

    private ChatSessionDto convertToChatSessionDto(ChatSession chatSession) {
        return ChatSessionDto.builder()
                .id(chatSession.getId())
                .title(chatSession.getTitle())
                .createdAt(chatSession.getCreatedAt())
                .updatedAt(chatSession.getUpdatedAt())
                .messageCount(chatSession.getMessages().size())
                .build();
    }
}
