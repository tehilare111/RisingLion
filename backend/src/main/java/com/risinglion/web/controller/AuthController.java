package com.risinglion.web.controller;

import com.risinglion.domain.entity.User;
import com.risinglion.domain.repo.UserRepository;
import com.risinglion.security.JwtService;
import com.risinglion.web.dto.AuthDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthController(UserRepository userRepository, PasswordEncoder passwordEncoder,
                          AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest req) {
        if (userRepository.existsByEmail(req.email()) || userRepository.existsByUsername(req.username())) {
            return ResponseEntity.badRequest().build();
        }
        User u = User.builder()
                .username(req.username())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .isAdmin(false)
                .build();
        userRepository.save(u);
        String token = jwtService.generateToken(new org.springframework.security.core.userdetails.User(u.getEmail(), u.getPassword(), java.util.List.of()), Map.of("isAdmin", false));
        return ResponseEntity.ok(new AuthResponse(token, new UserSummary(u.getId(), u.getEmail(), false)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.email(), req.password()));
        User user = userRepository.findByEmail(req.email()).orElseThrow();
        String token = jwtService.generateToken((UserDetails) auth.getPrincipal(), Map.of("isAdmin", user.isAdmin()));
        return ResponseEntity.ok(new AuthResponse(token, new UserSummary(user.getId(), user.getEmail(), user.isAdmin())));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        // placeholder: no-op
        return ResponseEntity.noContent().build();
    }
}
