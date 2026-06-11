package com.shop.user.service;

import com.shop.common.dto.UserProfileDto;
import com.shop.user.entity.UserProfile;
import com.shop.user.dto.CreateUserProfileDto;
import com.shop.user.repository.UserProfileRepository;
import com.shop.common.exception.ResourceNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserProfileRepository repository;

    public UserServiceImpl(UserProfileRepository repository) {
        this.repository = repository;
    }

    @Transactional
    @CacheEvict(value = "users", key = "#dto.username")
    public UserProfileDto createProfile(CreateUserProfileDto dto) {
        if (repository.findByUsername(dto.getUsername()).isPresent()) {
            throw new DataIntegrityViolationException("Profile already exists for username: " + dto.getUsername());
        }
        UserProfile profile = new UserProfile();
        profile.setUsername(dto.getUsername());
        profile.setFullName(dto.getFullName());
        profile.setAddress(dto.getAddress());
        UserProfile saved = repository.save(profile);
        return mapToDto(saved);
    }

    @Cacheable(value = "users", key = "#username")
    public UserProfileDto getProfile(String username) {
        UserProfile profile = repository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Profile", username));
        return mapToDto(profile);
    }

    private UserProfileDto mapToDto(UserProfile profile) {
        return new UserProfileDto(profile.getId(), profile.getUsername(), profile.getFullName(), profile.getAddress());
    }
}
