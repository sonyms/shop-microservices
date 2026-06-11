package com.shop.product.strategy;

import com.shop.product.entity.Product;
import java.util.List;
import java.util.Map;

public interface StockReservationStrategy {
    List<Product> reserveStock(Map<Long, Integer> items);
}
