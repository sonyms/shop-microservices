package com.shop.order.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.common.event.InventoryFailedEvent;
import com.shop.common.event.InventoryReservedEvent;
import com.shop.order.enums.OrderStatus;
import com.shop.order.service.OrderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@KafkaListener(topics = "inventory-events", groupId = "order-group")
public class InventoryEventListener {
    private static final Logger log = LoggerFactory.getLogger(InventoryEventListener.class);

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    public InventoryEventListener(OrderService orderService, ObjectMapper objectMapper) {
        this.orderService = orderService;
        this.objectMapper = objectMapper;
    }

    @org.springframework.kafka.annotation.KafkaHandler(isDefault = true)
    public void handleEvent(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            
            // It could be either InventoryReservedEvent or InventoryFailedEvent
            if (node.has("reason")) {
                // InventoryFailedEvent
                InventoryFailedEvent event = objectMapper.readValue(payload, InventoryFailedEvent.class);
                log.info("Received InventoryFailedEvent for Order ID: {}. Reason: {}", event.getOrderId(), event.getReason());
                orderService.updateOrderStatus(event.getOrderId(), OrderStatus.CANCELLED.name());
            } else if (node.has("orderId")) {
                // InventoryReservedEvent
                InventoryReservedEvent event = objectMapper.readValue(payload, InventoryReservedEvent.class);
                log.info("Received InventoryReservedEvent for Order ID: {}. Updating to PROCESSING.", event.getOrderId());
                orderService.updateOrderStatus(event.getOrderId(), OrderStatus.PROCESSING.name());
            }
        } catch (Exception e) {
            log.error("Failed to parse or process inventory event payload: {}", e.getMessage());
        }
    }
}
