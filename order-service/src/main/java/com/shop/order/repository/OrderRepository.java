package com.shop.order.repository;

import com.shop.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    
    Page<Order> findAllByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    Page<Order> findAll(Pageable pageable);

    @EntityGraph(attributePaths = {"items"})
    Optional<Order> findById(Long id);
}
