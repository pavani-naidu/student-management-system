package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.JwtResponse;
import com.sms.dto.LoginRequest;
import com.sms.dto.RegisterRequest;
import com.sms.dto.ProfileDTO;
import com.sms.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register and login endpoints")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<JwtResponse>> register(@Valid @RequestBody RegisterRequest request) {
        JwtResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<JwtResponse>> login(@Valid @RequestBody LoginRequest request) {
        JwtResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileDTO>> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ProfileDTO profile = authService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<ProfileDTO>> updateProfile(@RequestBody ProfileDTO dto) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        ProfileDTO profile = authService.updateProfile(email, dto);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", profile));
    }
}

