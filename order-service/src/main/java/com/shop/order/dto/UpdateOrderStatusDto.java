package com.shop.order.dto;

import jakarta.validation.constraints.NotBlank;

public class UpdateOrderStatusDto {
    @NotBlank(message = "Status cannot be empty")
    private String status;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
