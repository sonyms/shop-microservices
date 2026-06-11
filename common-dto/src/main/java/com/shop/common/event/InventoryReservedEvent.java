package com.shop.common.event;

public class InventoryReservedEvent {
    private String eventId;
    private Long orderId;
    private String userId;

    public InventoryReservedEvent() {}

    public InventoryReservedEvent(String eventId, Long orderId, String userId) {
        this.eventId = eventId;
        this.orderId = orderId;
        this.userId = userId;
    }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
}
