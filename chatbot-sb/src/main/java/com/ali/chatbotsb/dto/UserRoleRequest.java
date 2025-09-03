package com.ali.chatbotsb.dto;

import com.ali.chatbotsb.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRoleRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotEmpty(message = "At least one role must be specified")
    private Set<Role.RoleType> roles;
}

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
class SingleRoleRequest {

    @NotNull(message = "User ID is required")
    private UUID userId;

    @NotNull(message = "Role is required")
    private Role.RoleType role;
}
