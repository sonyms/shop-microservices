package com.shop.cart.listener;

import com.shop.cart.repository.CartRepository;
import com.shop.common.event.OrderPlacedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.concurrent.TimeUnit;
import com.fasterxml.jackson.databind.JsonNode;

@Component
@KafkaListener(topics = "order-events", groupId = "cart-group")
public class OrderEventListener {
    private static final Logger log = LoggerFactory.getLogger(OrderEventListener.class);

    private final CartRepository cartRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;

    public OrderEventListener(CartRepository cartRepository, StringRedisTemplate redisTemplate, ObjectMapper objectMapper) {
        this.cartRepository = cartRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
    }

    @org.springframework.kafka.annotation.KafkaHandler(isDefault = true)
    public void handleEvent(String payload) {
        try {
            JsonNode node = objectMapper.readTree(payload);
            // Quick check if it looks like an OrderPlacedEvent (has eventItems)
            if (node.has("items") || node.has("userId")) {
                OrderPlacedEvent event = objectMapper.readValue(payload, OrderPlacedEvent.class);
                
                String key = "processed_event:" + event.getEventId();
                Boolean isNewEvent = redisTemplate.opsForValue().setIfAbsent(key, "PROCESSED", 24, TimeUnit.HOURS);

                if (Boolean.FALSE.equals(isNewEvent)) {
                    log.info("Event {} already processed. Skipping.", event.getEventId());
                    return;
                }

                log.info("Processing order event {} for user {} - clearing cart", event.getEventId(), event.getUserId());
                cartRepository.deleteById(event.getUserId());
            } else {
                log.debug("Ignored event: {}", payload);
            }
        } catch (Exception e) {
            log.error("Failed to parse event payload: {}", e.getMessage());
        }
    }
}
