package com.shop.user.controller;

import com.shop.common.dto.UserProfileDto;
import com.shop.user.dto.CreateUserProfileDto;
import com.shop.user.service.UserService;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.shop.common.dto.ApiResponse;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<UserProfileDto>> createProfile(@Valid @RequestBody CreateUserProfileDto dto) {
        UserProfileDto saved = userService.createProfile(dto);
        return ResponseEntity.ok(ApiResponse.success("Profile created successfully", saved));
    }

    @GetMapping("/{username}")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(@PathVariable String username) {
        UserProfileDto profile = userService.getProfile(username);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully", profile));
    }
}
