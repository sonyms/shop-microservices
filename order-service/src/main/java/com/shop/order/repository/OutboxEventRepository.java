package com.shop.order.repository;

import com.shop.order.entity.OutboxEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutboxEventRepository extends JpaRepository<OutboxEvent, String> {

    @Query(value = "SELECT * FROM outbox_events WHERE status = 'PENDING' ORDER BY created_at ASC LIMIT 50 FOR UPDATE SKIP LOCKED", nativeQuery = true)
    List<OutboxEvent> findPendingEventsForUpdate();

    @Modifying
    @Query(value = "DELETE FROM outbox_events WHERE status = 'COMPLETED' AND created_at < NOW() - INTERVAL '7 days'", nativeQuery = true)
    void deleteOldCompletedEvents();
}
