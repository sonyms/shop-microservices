package com.shop.clients.fallback;

import com.shop.clients.feign.ProductClient;
import com.shop.common.dto.ProductResponseDto;
import com.shop.common.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;
import com.shop.common.dto.ReserveStockRequestDto;

@Component
public class ProductClientFallback implements ProductClient {

    @Override
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProduct(Long id) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiResponse<>("SERVICE_UNAVAILABLE", "Product Service is currently down.", null));
    }

    @Override
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> reserveStock(ReserveStockRequestDto dto) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiResponse<>("SERVICE_UNAVAILABLE", "Unable to reserve stock. Product Service is down.", null));
    }
}
