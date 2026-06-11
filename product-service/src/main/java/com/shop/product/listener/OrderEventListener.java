package com.shop.product.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.common.dto.ReserveStockRequestDto;
import com.shop.common.event.InventoryFailedEvent;
import com.shop.common.event.InventoryReservedEvent;
import com.shop.common.event.OrderPlacedEvent;
import com.shop.product.service.ProductService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaHandler;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@KafkaListener(topics = "order-events", groupId = "product-group")
public class OrderEventListener {
    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);

    private final ProductService productService;
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public OrderEventListener(ProductService productService, KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper) {
        this.productService = productService;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
    }

    @KafkaHandler(isDefault = true)
    public void handleEvent(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);

            if (node.has("items") && node.has("orderId")) {
                OrderPlacedEvent event = objectMapper.readValue(payload, OrderPlacedEvent.class);
                log.info("Received OrderPlacedEvent for Order ID: {}. Attempting to reserve stock.",
                        event.getOrderId());

                try {
                    Map<Long, Integer> reservationMap = new HashMap<>();
                    for (OrderPlacedEvent.OrderItemEventDto item : event.getItems()) {
                        reservationMap.put(item.getProductId(), item.getQuantity());
                    }

                    ReserveStockRequestDto requestDto = new ReserveStockRequestDto();
                    requestDto.setItems(reservationMap);

                    // Attempt stock reservation
                    productService.reserveStock(requestDto);

                    // Publish success event
                    InventoryReservedEvent successEvent = new InventoryReservedEvent(
                            UUID.randomUUID().toString(),
                            event.getOrderId(),
                            event.getUserId());
                    kafkaTemplate.send("inventory-events", objectMapper.writeValueAsString(successEvent));
                    log.info("Stock reserved successfully for Order ID: {}", event.getOrderId());

                } catch (Exception e) {
                    log.warn("Failed to reserve stock for Order ID: {}. Reason: {}", event.getOrderId(),
                            e.getMessage());

                    // Publish failure event
                    InventoryFailedEvent failedEvent = new InventoryFailedEvent(
                            UUID.randomUUID().toString(),
                            event.getOrderId(),
                            event.getUserId(),
                            e.getMessage());
                    kafkaTemplate.send("inventory-events", objectMapper.writeValueAsString(failedEvent));
                }
            } else {
                log.debug("Ignored irrelevant event payload.");
            }
        } catch (Exception e) {
            log.error("Failed to parse event payload: {}", e.getMessage());
        }
    }
}
