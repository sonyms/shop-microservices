package com.shop.common.dto;

import jakarta.validation.constraints.NotEmpty;
import java.util.Map;

public class ReserveStockRequestDto {
    @NotEmpty(message = "Items map cannot be empty")
    private Map<Long, Integer> items;

    public Map<Long, Integer> getItems() { return items; }
    public void setItems(Map<Long, Integer> items) { this.items = items; }
}
