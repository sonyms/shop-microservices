package com.shop.clients.feign;

import com.shop.common.dto.CartDto;
import com.shop.common.dto.CartItemDto;
import com.shop.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "cart-service", url = "${feign.client.cart.url:}", path = "/cart", fallback = com.shop.clients.fallback.CartClientFallback.class)
public interface CartClient {

    @GetMapping("/{userId}")
    ResponseEntity<ApiResponse<CartDto>> getCart(@PathVariable("userId") String userId);

    @PostMapping("/{userId}/add")
    ResponseEntity<ApiResponse<CartDto>> addToCart(@PathVariable("userId") String userId, @RequestBody CartItemDto item);
}
