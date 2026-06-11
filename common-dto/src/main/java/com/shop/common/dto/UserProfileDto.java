package com.shop.common.dto;

import java.io.Serializable;

public class UserProfileDto implements Serializable {
    private Long id;
    private String username;
    private String fullName;
    private String address;

    public UserProfileDto() {}

    public UserProfileDto(Long id, String username, String fullName, String address) {
        this.id = id;
        this.username = username;
        this.fullName = fullName;
        this.address = address;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
}
