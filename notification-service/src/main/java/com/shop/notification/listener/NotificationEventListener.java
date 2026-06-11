package com.shop.notification.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.common.event.OrderPlacedEvent;
import com.shop.common.event.OrderStatusUpdatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;

import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;

@Component
public class NotificationEventListener {
    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    private final ObjectMapper objectMapper;

    public NotificationEventListener(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void init() {
        log.info("NotificationEventListener Bean Successfully Initialized!");
    }

    @KafkaListener(topics = "order-events", groupId = "notification-group")
    public void handleOrderEvents(String payload) {
        log.info("Received Kafka message in NotificationService: {}", payload);
        try {
            JsonNode node = objectMapper.readTree(payload);
            if (node.has("items")) {
                OrderPlacedEvent event = objectMapper.readValue(payload, OrderPlacedEvent.class);
                log.info(
                        "\n========== EMAIL SENT ==========\nTo: user_{}@example.com\nSubject: We received your order!\nBody: Your order {} is currently pending inventory verification.\n================================",
                        event.getUserId(), event.getOrderId());
            } else if (node.has("newStatus")) {
                OrderStatusUpdatedEvent event = objectMapper.readValue(payload, OrderStatusUpdatedEvent.class);
                log.info(
                        "\n========== EMAIL SENT ==========\nTo: user_{}@example.com\nSubject: Order Status Update\nBody: Your order {} is now {}.\n================================",
                        event.getUserId(), event.getOrderId(), event.getNewStatus());
            }
        } catch (Exception e) {
            log.error("Failed to parse event payload: {}", e.getMessage());
        }
    }
}
