package com.shop.cart.controller;

import com.shop.common.dto.CartItemDto;
import com.shop.common.dto.ApiResponse;
import com.shop.common.dto.CartDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/cart")
public class CartController {

    private final com.shop.cart.service.CartService cartService;

    public CartController(com.shop.cart.service.CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ApiResponse<CartDto>> getCart(@PathVariable String userId) {
        return ResponseEntity.ok(ApiResponse.success("Cart fetched successfully", cartService.getCart(userId)));
    }

    @PostMapping("/{userId}/add")
    public ResponseEntity<ApiResponse<CartDto>> addToCart(@PathVariable String userId, @Valid @RequestBody CartItemDto itemDto) {
        return ResponseEntity.ok(ApiResponse.success("Item added to cart securely", cartService.addToCart(userId, itemDto)));
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<ApiResponse<CartDto>> removeFromCart(@PathVariable String userId, @PathVariable Long productId) {
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", cartService.removeFromCart(userId, productId)));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<ApiResponse<Void>> clearCart(@PathVariable String userId) {
        cartService.clearCart(userId);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared successfully"));
    }
}
