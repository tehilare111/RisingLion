package com.risinglion.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDtos {
    public record SignupRequest(
            @NotBlank String username,
            @Email @NotBlank String email,
            @Size(min = 6) String password
    ) {}

    public record LoginRequest(
            @Email @NotBlank String email,
            @NotBlank String password
    ) {}

    public record AuthResponse(String accessToken, UserSummary user) {}

    public record UserSummary(Long id, String email, boolean isAdmin) {}

    public record ResetPasswordRequest(@Email @NotBlank String email) {}
}
