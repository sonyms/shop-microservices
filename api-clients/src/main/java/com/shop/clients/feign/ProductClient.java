package com.shop.clients.feign;

import com.shop.common.dto.ProductResponseDto;
import com.shop.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import com.shop.common.dto.ReserveStockRequestDto;
import java.util.List;

@FeignClient(name = "product-service", url = "${feign.client.product.url:}", path = "/products", fallback = com.shop.clients.fallback.ProductClientFallback.class)
public interface ProductClient {

    @GetMapping("/{id}")
    ResponseEntity<ApiResponse<ProductResponseDto>> getProduct(@PathVariable("id") Long id);

    @PostMapping("/reserve")
    ResponseEntity<ApiResponse<List<ProductResponseDto>>> reserveStock(@RequestBody ReserveStockRequestDto dto);
}
