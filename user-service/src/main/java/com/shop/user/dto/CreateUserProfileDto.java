package com.shop.user.dto;

import jakarta.validation.constraints.NotBlank;

public class CreateUserProfileDto {
    @NotBlank(message = "Username is required")
    private String username;
    private String fullName;
    @NotBlank(message = "Address is required")
    private String address;

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
