package com.shop.order.service;

import com.shop.common.dto.CartDto;
import com.shop.common.dto.CartItemDto;
import com.shop.clients.feign.CartClient;
import com.shop.clients.feign.ProductClient;
import com.shop.common.dto.OrderItemDto;
import com.shop.common.dto.OrderResponseDto;
import com.shop.common.event.OrderPlacedEvent;
import com.shop.common.event.OrderStatusUpdatedEvent;
import com.shop.order.entity.Order;
import com.shop.order.entity.OrderItem;
import com.shop.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.order.entity.OutboxEvent;
import com.shop.order.repository.OutboxEventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.shop.common.exception.BaseException;
import com.shop.common.exception.BadRequestException;
import com.shop.common.exception.ResourceNotFoundException;
import com.shop.order.enums.OrderStatus;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CartClient cartClient;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    public OrderServiceImpl(OrderRepository orderRepository,
            CartClient cartClient,
            OutboxEventRepository outboxEventRepository,
            ObjectMapper objectMapper) {
        this.orderRepository = orderRepository;
        this.cartClient = cartClient;
        this.outboxEventRepository = outboxEventRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public OrderResponseDto checkout(String userId) {
        // 1. Fetch Cart
        CartDto cart = cartClient.getCart(userId).getBody().getData();
        if (cart == null || cart.getItems().isEmpty()) {
            throw new BadRequestException("Cannot checkout empty cart");
        }

        // 2. Prepare items for reservation
        Map<Long, Integer> reservationMap = new HashMap<>();
        List<OrderPlacedEvent.OrderItemEventDto> eventItems = new ArrayList<>();

        for (CartItemDto cartItem : cart.getItems()) {
            reservationMap.put(cartItem.getProductId(), cartItem.getQuantity());
            eventItems.add(new OrderPlacedEvent.OrderItemEventDto(cartItem.getProductId(), cartItem.getQuantity()));
        }

        // 3. Prepare OrderItems and Calculate total
        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItemDto cartItem : cart.getItems()) {
            totalAmount = totalAmount.add(cartItem.getPrice().multiply(new BigDecimal(cartItem.getQuantity())));

            OrderItem orderItem = new OrderItem();
            orderItem.setProductId(cartItem.getProductId());
            orderItem.setPrice(cartItem.getPrice());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItems.add(orderItem);
        }

        // 5. Save Order
        Order order = new Order();
        order.setUserId(userId);
        order.setTotalAmount(totalAmount);
        order.setStatus(OrderStatus.PENDING);

        for (OrderItem item : orderItems) {
            item.setOrder(order);
            order.getItems().add(item);
        }

        Order savedOrder = orderRepository.save(order);

        // 6. Save Event to Outbox (Same Transaction)
        OrderPlacedEvent event = new OrderPlacedEvent(
                UUID.randomUUID().toString(),
                savedOrder.getId(),
                userId,
                eventItems);

        try {
            String payload = objectMapper.writeValueAsString(event);
            OutboxEvent outboxEvent = new OutboxEvent(event.getEventId(), savedOrder.getId().toString(),
                    "OrderPlacedEvent", payload);
            outboxEventRepository.save(outboxEvent);
        } catch (Exception e) {
            throw new BaseException("SERIALIZATION_ERROR", "Failed to serialize outbox event",
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return mapToDto(savedOrder);
    }

    public Page<OrderResponseDto> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable)
                .map(this::mapToDto);
    }

    public Page<OrderResponseDto> getUserOrders(String userId, Pageable pageable) {
        return orderRepository.findAllByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(this::mapToDto);
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(Long orderId, String newStatus) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        order.setStatus(OrderStatus.valueOf(newStatus.toUpperCase()));
        Order savedOrder = orderRepository.save(order);

        // Emit Event
        OrderStatusUpdatedEvent event = new OrderStatusUpdatedEvent(
                UUID.randomUUID().toString(),
                savedOrder.getId(),
                savedOrder.getUserId(),
                newStatus);

        try {
            String payload = objectMapper.writeValueAsString(event);
            OutboxEvent outboxEvent = new OutboxEvent(event.getEventId(), savedOrder.getId().toString(),
                    "OrderStatusUpdatedEvent", payload);
            outboxEventRepository.save(outboxEvent);
        } catch (Exception e) {
            throw new BaseException("SERIALIZATION_ERROR", "Failed to serialize outbox event",
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return mapToDto(savedOrder);
    }

    private OrderResponseDto mapToDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setUserId(order.getUserId());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus() != null ? order.getStatus().name() : null);
        dto.setCreatedAt(order.getCreatedAt());

        List<OrderItemDto> itemDtos = order.getItems().stream().map(item -> {
            OrderItemDto itemDto = new OrderItemDto();
            itemDto.setId(item.getId());
            itemDto.setProductId(item.getProductId());
            itemDto.setQuantity(item.getQuantity());
            itemDto.setPrice(item.getPrice());
            return itemDto;
        }).toList();
        dto.setItems(itemDtos);

        return dto;
    }
}
