package com.shop.product.strategy;

import com.shop.product.entity.Product;
import com.shop.product.exception.InsufficientStockException;
import com.shop.product.repository.ProductRepository;
import com.shop.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component("databaseStrategy")
public class DatabaseReservationStrategy implements StockReservationStrategy {

    private final ProductRepository productRepository;

    public DatabaseReservationStrategy(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public List<Product> reserveStock(Map<Long, Integer> items) {
        List<Long> productIds = items.keySet().stream().sorted().toList();
        List<Product> products = productRepository.findByIdsForUpdate(productIds);
        
        if (products.size() != productIds.size()) {
            throw new ResourceNotFoundException("One or more products");
        }

        List<Product> reservedProducts = new ArrayList<>();
        
        for (Product product : products) {
            int requestedQuantity = items.get(product.getId());
            if (product.getStockQuantity() < requestedQuantity) {
                throw new InsufficientStockException("Not enough stock for product: " + product.getName());
            }
            product.setStockQuantity(product.getStockQuantity() - requestedQuantity);
            reservedProducts.add(productRepository.save(product));
        }
        
        return reservedProducts;
    }
}
