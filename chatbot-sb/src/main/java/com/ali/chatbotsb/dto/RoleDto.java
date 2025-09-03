package com.ali.chatbotsb.dto;

import com.ali.chatbotsb.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleDto {

    private Long id;
    private Role.RoleType name;
    private String description;
}
