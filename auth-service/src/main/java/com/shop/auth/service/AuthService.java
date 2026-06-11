package com.shop.auth.service;

import com.shop.auth.dto.AuthRequest;
import com.shop.auth.dto.UserRegistrationDto;
import com.shop.auth.dto.UpdateStatusDto;
import com.shop.auth.dto.UpdateUserDto;
import com.shop.auth.dto.UserResponseDto;
import com.shop.auth.dto.LoginResponseDto;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuthService {
    void register(UserRegistrationDto dto);
    void createUser(UserRegistrationDto dto);
    Page<UserResponseDto> getAllUsers(Pageable pageable);
    void updateUserStatus(Long id, UpdateStatusDto dto);
    void updateUser(Long id, UpdateUserDto dto);
    void deleteUser(Long id);
    LoginResponseDto login(AuthRequest authRequest);
    void validateToken(String token);
}
