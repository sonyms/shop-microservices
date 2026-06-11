package com.shop.product.strategy;

import com.shop.product.entity.Product;
import com.shop.product.repository.ProductRepository;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component("redisStrategy")
public class RedisReservationStrategy implements StockReservationStrategy {

    private final StringRedisTemplate redisTemplate;
    private final ProductRepository productRepository; // Fallback to get product details

    public RedisReservationStrategy(StringRedisTemplate redisTemplate, ProductRepository productRepository) {
        this.redisTemplate = redisTemplate;
        this.productRepository = productRepository;
    }

    // Lua script: Check all stock first, if valid, deduct all.
    private static final String LUA_SCRIPT =
            "local keys = KEYS\n" +
            "local argv = ARGV\n" +
            "for i = 1, #keys do\n" +
            "   local currentStock = tonumber(redis.call('GET', keys[i]))\n" +
            "   local reqQty = tonumber(argv[i])\n" +
            "   if currentStock == nil or currentStock < reqQty then\n" +
            "       return 0\n" + // Failed
            "   end\n" +
            "end\n" +
            "for i = 1, #keys do\n" +
            "   redis.call('DECRBY', keys[i], tonumber(argv[i]))\n" +
            "end\n" +
            "return 1\n"; // Success

    @Override
    public List<Product> reserveStock(Map<Long, Integer> items) {
        List<String> keys = new ArrayList<>();
        List<String> args = new ArrayList<>();
        
        for (Map.Entry<Long, Integer> entry : items.entrySet()) {
            keys.add("product:stock:" + entry.getKey());
            args.add(String.valueOf(entry.getValue()));
        }

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(LUA_SCRIPT);
        redisScript.setResultType(Long.class);

        Long result = redisTemplate.execute(redisScript, keys, args.toArray(new Object[0]));

        if (result == null || result == 0L) {
            throw new com.shop.product.exception.InsufficientStockException("Not enough stock or stock cache not initialized.");
        }

        // Return the full product objects (stock quantity returned is from DB, which might be out of sync, but we don't care because Redis handled it)
        // In a true async setup, we'd fire an event to sync DB. For now, we just fetch names.
        List<Product> products = new ArrayList<>();
        for (Long id : items.keySet()) {
            products.add(productRepository.findById(id).orElse(new Product()));
        }
        
        return products;
    }
}
