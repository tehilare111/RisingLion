package com.risinglion.web.controller;

import com.risinglion.domain.entity.User;
import com.risinglion.domain.repo.UserRepository;
import com.risinglion.mapper.Mappers;
import com.risinglion.web.dto.CommonDtos.UserAdminDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final UserRepository userRepository;
    private final Mappers mappers;

    public AdminController(UserRepository userRepository, Mappers mappers) { this.userRepository = userRepository; this.mappers = mappers; }

    @GetMapping("/users")
    public List<UserAdminDto> users() { return userRepository.findAll().stream().map(mappers::toUserAdminDto).toList(); }

    @PatchMapping("/users/{id}/role/{role}")
    public ResponseEntity<Void> changeRole(@PathVariable Long id, @PathVariable String role) {
        User u = userRepository.findById(id).orElseThrow();
        u.setAdmin("ADMIN".equalsIgnoreCase(role));
        userRepository.save(u);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
