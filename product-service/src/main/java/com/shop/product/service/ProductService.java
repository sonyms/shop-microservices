package com.shop.product.service;

import com.shop.common.dto.ProductResponseDto;
import com.shop.product.dto.ProductRequestDto;
import com.shop.common.dto.ReserveStockRequestDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    void setUseRedis(boolean useRedis);
    boolean isUseRedis();
    List<ProductResponseDto> reserveStock(ReserveStockRequestDto dto);
    Page<ProductResponseDto> getAllProducts(Pageable pageable);
    ProductResponseDto getProduct(Long id);
    ProductResponseDto createProduct(ProductRequestDto dto);
    ProductResponseDto updateProduct(Long id, ProductRequestDto dto);
    void deleteProduct(Long id);
    void initRedis();
    String uploadImage(MultipartFile file);
}
