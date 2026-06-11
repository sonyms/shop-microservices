package com.shop.common.event;

public class OrderStatusUpdatedEvent {
    private String eventId;
    private Long orderId;
    private String userId;
    private String newStatus;

    public OrderStatusUpdatedEvent() {}

    public OrderStatusUpdatedEvent(String eventId, Long orderId, String userId, String newStatus) {
        this.eventId = eventId;
        this.orderId = orderId;
        this.userId = userId;
        this.newStatus = newStatus;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getNewStatus() { return newStatus; }
    public void setNewStatus(String newStatus) { this.newStatus = newStatus; }
}
