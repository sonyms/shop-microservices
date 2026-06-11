package com.shop.user.service;

import com.shop.common.dto.UserProfileDto;
import com.shop.user.dto.CreateUserProfileDto;

public interface UserService {
    UserProfileDto createProfile(CreateUserProfileDto dto);
    UserProfileDto getProfile(String username);
}
