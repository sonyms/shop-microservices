package com.shop.common.dto;

import java.math.BigDecimal;

public class ProductResponseDto {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private String imageUrl;
    private Object category;
    private Object brand;

    public ProductResponseDto() {}

    public ProductResponseDto(Long id, String name, String description, BigDecimal price, Integer stockQuantity, String imageUrl, Object category, Object brand) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.stockQuantity = stockQuantity;
        this.imageUrl = imageUrl;
        this.category = category;
        this.brand = brand;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public Object getCategory() { return category; }
    public void setCategory(Object category) { this.category = category; }
    public Object getBrand() { return brand; }
    public void setBrand(Object brand) { this.brand = brand; }
}
