package com.risinglion.web.controller;

import com.risinglion.domain.entity.User;
import com.risinglion.domain.repo.UserRepository;
import com.risinglion.web.dto.CommonDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) { this.userRepository = userRepository; }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        return ResponseEntity.ok(new MeResponse(user.getId(), user.getEmail(), user.isAdmin()));
    }

    @PatchMapping("/me")
    public ResponseEntity<MeResponse> updateMe(Authentication authentication, @Valid @RequestBody MeUpdateRequest req) {
        User user = userRepository.findByEmail(authentication.getName()).orElseThrow();
        if (req.email() != null) user.setEmail(req.email());
        userRepository.save(user);
        return ResponseEntity.ok(new MeResponse(user.getId(), user.getEmail(), user.isAdmin()));
    }
}
