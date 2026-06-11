package com.shop.auth.controller;

import com.shop.auth.dto.AuthRequest;
import com.shop.auth.dto.UserRegistrationDto;
import com.shop.auth.dto.UpdateStatusDto;
import com.shop.auth.dto.UpdateUserDto;
import com.shop.auth.dto.UserResponseDto;
import com.shop.auth.dto.LoginResponseDto;
import com.shop.auth.service.AuthService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.shop.common.dto.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody UserRegistrationDto dto) {
        log.info("Received registration request for user: {}", dto.getUsername());
        authService.register(dto);
        log.info("Successfully registered user: {}", dto.getUsername());
        return ResponseEntity.ok(ApiResponse.success("User added to the system successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@Valid @RequestBody AuthRequest authRequest) {
        log.info("Received login request for user: {}", authRequest.getUsername());
        LoginResponseDto responseData = authService.login(authRequest);
        log.info("Login successful for user: {}", authRequest.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Login successful", responseData));
    }

    @GetMapping("/validate")
    public ResponseEntity<ApiResponse<Void>> validateToken(@RequestParam("token") String token) {
        authService.validateToken(token);
        return ResponseEntity.ok(ApiResponse.success("Token is valid"));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponseDto>>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Fetched all users", authService.getAllUsers(pageable)));
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> updateUserStatus(@PathVariable Long id, @Valid @RequestBody UpdateStatusDto dto) {
        authService.updateUserStatus(id, dto);
        return ResponseEntity.ok(ApiResponse.success("User status updated"));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> updateUser(@PathVariable Long id, @Valid @RequestBody UpdateUserDto dto) {
        authService.updateUser(id, dto);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully"));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<Void>> createUser(@Valid @RequestBody UserRegistrationDto dto) {
        authService.createUser(dto);
        return ResponseEntity.ok(ApiResponse.success("User created successfully"));
    }
}
