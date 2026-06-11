package com.shop.common.event;

import java.util.List;

public class OrderPlacedEvent {
    private String eventId;
    private Long orderId;
    private String userId;
    private List<OrderItemEventDto> items;

    public OrderPlacedEvent() {}

    public OrderPlacedEvent(String eventId, Long orderId, String userId, List<OrderItemEventDto> items) {
        this.eventId = eventId;
        this.orderId = orderId;
        this.userId = userId;
        this.items = items;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public List<OrderItemEventDto> getItems() { return items; }
    public void setItems(List<OrderItemEventDto> items) { this.items = items; }

    public static class OrderItemEventDto {
        private Long productId;
        private Integer quantity;

        public OrderItemEventDto() {}

        public OrderItemEventDto(Long productId, Integer quantity) {
            this.productId = productId;
            this.quantity = quantity;
        }

        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }
}
