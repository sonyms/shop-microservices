package com.shop.order.service;

import com.shop.common.dto.OrderResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    OrderResponseDto checkout(String userId);
    Page<OrderResponseDto> getAllOrders(Pageable pageable);
    Page<OrderResponseDto> getUserOrders(String userId, Pageable pageable);
    OrderResponseDto updateOrderStatus(Long orderId, String newStatus);
}
