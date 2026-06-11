package com.shop.clients.fallback;

import com.shop.clients.feign.CartClient;
import com.shop.common.dto.CartDto;
import com.shop.common.dto.CartItemDto;
import com.shop.common.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

@Component
public class CartClientFallback implements CartClient {

    @Override
    public ResponseEntity<ApiResponse<CartDto>> getCart(String userId) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiResponse<>("SERVICE_UNAVAILABLE", "Cart Service is currently down.", null));
    }

    @Override
    public ResponseEntity<ApiResponse<CartDto>> addToCart(String userId, CartItemDto item) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiResponse<>("SERVICE_UNAVAILABLE", "Unable to add to cart. Cart Service is down.", null));
    }
}
