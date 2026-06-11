package com.shop.cart.service;

import com.shop.common.dto.CartDto;
import com.shop.common.dto.CartItemDto;

public interface CartService {
    CartDto getCart(String userId);
    CartDto addToCart(String userId, CartItemDto itemDto);
    CartDto removeFromCart(String userId, Long productId);
    void clearCart(String userId);
}
