package com.shop.common.event;

public class InventoryFailedEvent {
    private String eventId;
    private Long orderId;
    private String userId;
    private String reason;

    public InventoryFailedEvent() {}

    public InventoryFailedEvent(String eventId, Long orderId, String userId, String reason) {
        this.eventId = eventId;
        this.orderId = orderId;
        this.userId = userId;
        this.reason = reason;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
