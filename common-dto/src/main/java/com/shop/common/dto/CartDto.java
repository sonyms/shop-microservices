package com.shop.common.dto;

import java.util.ArrayList;
import java.util.List;

public class CartDto {
    private String id;
    private List<CartItemDto> items = new ArrayList<>();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public List<CartItemDto> getItems() { return items; }
    public void setItems(List<CartItemDto> items) { this.items = items; }
}
