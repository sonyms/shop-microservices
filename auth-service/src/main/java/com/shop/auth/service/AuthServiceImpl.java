package com.shop.auth.service;

import com.shop.auth.dto.AuthRequest;
import com.shop.auth.entity.UserCredential;
import com.shop.auth.exception.InvalidCredentialsException;
import com.shop.auth.dto.UpdateStatusDto;
import com.shop.auth.dto.UpdateUserDto;
import com.shop.auth.dto.UserRegistrationDto;
import com.shop.auth.dto.UserResponseDto;
import com.shop.auth.dto.LoginResponseDto;
import com.shop.auth.exception.UserAlreadyExistsException;
import com.shop.auth.repository.UserCredentialRepository;
import com.shop.auth.security.JwtUtil;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.shop.common.exception.ResourceNotFoundException;

@Service
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final UserCredentialRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthServiceImpl(UserCredentialRepository repository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       AuthenticationManager authenticationManager) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public void register(UserRegistrationDto dto) {
        if (repository.findByUsername(dto.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("Username is already taken");
        }
        UserCredential userCredential = new UserCredential();
        userCredential.setUsername(dto.getUsername());
        userCredential.setFirstName(dto.getFirstName());
        userCredential.setLastName(dto.getLastName());
        userCredential.setMobile(dto.getMobile());
        // SECURITY FIX: Force role to USER for public registrations
        userCredential.setRole("USER");
        userCredential.setPassword(passwordEncoder.encode(dto.getPassword()));
        repository.save(userCredential);
    }

    @Transactional
    public void createUser(UserRegistrationDto dto) {
        if (repository.findByUsername(dto.getUsername()).isPresent()) {
            throw new UserAlreadyExistsException("Username is already taken");
        }
        UserCredential userCredential = new UserCredential();
        userCredential.setUsername(dto.getUsername());
        userCredential.setFirstName(dto.getFirstName());
        userCredential.setLastName(dto.getLastName());
        userCredential.setMobile(dto.getMobile());
        if (dto.getRole() == null || dto.getRole().trim().isEmpty()) {
            userCredential.setRole("USER");
        } else {
            userCredential.setRole(dto.getRole());
        }
        userCredential.setPassword(passwordEncoder.encode(dto.getPassword()));
        repository.save(userCredential);
    }

    public Page<UserResponseDto> getAllUsers(Pageable pageable) {
        return repository.findAll(pageable).map(u -> {
            UserResponseDto dto = new UserResponseDto();
            dto.setId(u.getId());
            dto.setUsername(u.getUsername());
            dto.setEmail(u.getUsername()); // Map username to email for frontend compatibility
            dto.setFirstName(u.getFirstName());
            dto.setLastName(u.getLastName());
            dto.setMobile(u.getMobile());
            dto.setRole(u.getRole());
            dto.setStatus(u.getStatus());
            return dto;
        });
    }

    @Transactional
    public void updateUserStatus(Long id, UpdateStatusDto dto) {
        UserCredential user = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
        user.setStatus(dto.getStatus());
        repository.save(user);
    }

    @Transactional
    public void updateUser(Long id, UpdateUserDto dto) {
        UserCredential user = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User", id));
        if (dto.getUsername() != null && !dto.getUsername().trim().isEmpty()) {
            user.setUsername(dto.getUsername());
        }
        if (dto.getFirstName() != null) {
            user.setFirstName(dto.getFirstName());
        }
        if (dto.getLastName() != null) {
            user.setLastName(dto.getLastName());
        }
        if (dto.getMobile() != null) {
            user.setMobile(dto.getMobile());
        }
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
        }
        if (dto.getPassword() != null && !dto.getPassword().trim().isEmpty()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        repository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        repository.deleteById(id);
    }

    public LoginResponseDto login(AuthRequest authRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authRequest.getUsername(), authRequest.getPassword())
            );

            if (authentication.isAuthenticated()) {
                UserCredential user = repository.findByUsername(authRequest.getUsername()).orElseThrow();
                if ("BANNED".equalsIgnoreCase(user.getStatus())) {
                    throw new InvalidCredentialsException("Your account has been banned.");
                }
                String role = user.getRole() != null ? user.getRole() : "USER";
                String token = jwtUtil.generateToken(authRequest.getUsername(), role);
                return new LoginResponseDto(token, role);
            } else {
                throw new InvalidCredentialsException("Invalid username or password");
            }
        } catch (org.springframework.security.core.AuthenticationException e) {
            throw new InvalidCredentialsException("Invalid username or password");
        }
    }

    public void validateToken(String token) {
        jwtUtil.validateToken(token);
    }
}
