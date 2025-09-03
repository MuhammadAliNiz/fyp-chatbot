package com.ali.chatbotsb.repository;

import com.ali.chatbotsb.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.Set;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(Role.RoleType name);

    Set<Role> findByNameIn(Set<Role.RoleType> names);

    boolean existsByName(Role.RoleType name);
}
