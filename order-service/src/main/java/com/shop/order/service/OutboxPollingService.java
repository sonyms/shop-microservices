package com.shop.order.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shop.order.entity.OutboxEvent;
import com.shop.order.repository.OutboxEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class OutboxPollingService {

    private static final Logger log = LoggerFactory.getLogger(OutboxPollingService.class);

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    public OutboxPollingService(OutboxEventRepository outboxEventRepository,
            KafkaTemplate<String, String> kafkaTemplate,
            ObjectMapper objectMapper) {
        this.outboxEventRepository = outboxEventRepository;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Scheduled(fixedDelayString = "${outbox.polling.interval-ms:5000}")
    @Transactional
    public void pollOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findPendingEventsForUpdate();

        if (!pendingEvents.isEmpty()) {
            log.info("Found {} pending outbox events to publish", pendingEvents.size());
        }

        for (OutboxEvent event : pendingEvents) {
            try {
                // Send raw JSON string directly since we switched to StringSerializer
                kafkaTemplate.send("order-events", event.getPayload()).get();

                event.setStatus("COMPLETED");
                outboxEventRepository.save(event);

            } catch (Exception e) {
                log.error("Failed to process outbox event: {}", event.getId(), e);
                // Keep it PENDING so it retries on next poll
            }
        }
    }

    @Scheduled(cron = "0 0 3 * * ?") // Every day at 3 AM
    @Transactional
    public void cleanupOldEvents() {
        log.info("Running outbox cleanup job...");
        outboxEventRepository.deleteOldCompletedEvents();
        log.info("Outbox cleanup job completed.");
    }
}
