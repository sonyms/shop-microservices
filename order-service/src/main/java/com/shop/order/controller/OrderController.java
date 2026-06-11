package com.shop.order.controller;

import com.shop.common.dto.ApiResponse;
import com.shop.common.dto.OrderResponseDto;
import com.shop.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.shop.order.dto.UpdateOrderStatusDto;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.shop.common.security.RequireRole;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private static final Logger log = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/{userId}/checkout")
    public ResponseEntity<ApiResponse<OrderResponseDto>> checkout(@PathVariable String userId) {
        log.info("Processing checkout request for user: {}", userId);
        return ResponseEntity.ok(ApiResponse.success("Order placed successfully", orderService.checkout(userId)));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<Page<OrderResponseDto>>> getUserOrders(@PathVariable String userId,
            Pageable pageable) {
        log.info("Fetching orders for user: {}", userId);
        return ResponseEntity
                .ok(ApiResponse.success("Fetched user orders", orderService.getUserOrders(userId, pageable)));
    }

    @RequireRole("ADMIN")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderResponseDto>>> getAllOrders(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Fetched all orders", orderService.getAllOrders(pageable)));
    }

    @RequireRole("ADMIN")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<OrderResponseDto>> updateOrderStatus(@PathVariable Long id,
            @Valid @RequestBody UpdateOrderStatusDto dto) {
        return ResponseEntity
                .ok(ApiResponse.success("Order status updated", orderService.updateOrderStatus(id, dto.getStatus())));
    }
}
