package com.shop.product.controller;

import com.shop.common.dto.ApiResponse;
import com.shop.common.dto.ProductResponseDto;
import com.shop.product.dto.ProductRequestDto;
import com.shop.common.dto.ReserveStockRequestDto;
import com.shop.product.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.shop.common.security.RequireRole;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponseDto>>> getAllProducts(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success("Fetched all products", productService.getAllProducts(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Product fetched successfully", productService.getProduct(id)));
    }

    @RequireRole("ADMIN")
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponseDto>> createProduct(@Valid @RequestBody ProductRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Product created successfully", productService.createProduct(dto)));
    }

    @RequireRole("ADMIN")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProductResponseDto>> updateProduct(@PathVariable Long id, @Valid @RequestBody ProductRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", productService.updateProduct(id, dto)));
    }

    @RequireRole("ADMIN")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deleted successfully", null));
    }

    @PostMapping("/reserve")
    public ResponseEntity<ApiResponse<List<ProductResponseDto>>> reserveStock(@Valid @RequestBody ReserveStockRequestDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Stock reserved successfully", productService.reserveStock(dto)));
    }

    @RequireRole("ADMIN")
    @PostMapping("/upload")
    public ResponseEntity<ApiResponse<String>> uploadImage(@RequestParam("file") MultipartFile file) {
        String fileUrl = productService.uploadImage(file);
        return ResponseEntity.ok(ApiResponse.success("File uploaded successfully", fileUrl));
    }

    @RequireRole("ADMIN")
    @PostMapping("/config/strategy")
    public ResponseEntity<ApiResponse<String>> setStrategy(@RequestParam String type) {
        if ("REDIS".equalsIgnoreCase(type)) {
            productService.setUseRedis(true);
            return ResponseEntity.ok(ApiResponse.success("Strategy switched to REDIS", null));
        } else {
            productService.setUseRedis(false);
            return ResponseEntity.ok(ApiResponse.success("Strategy switched to DATABASE", null));
        }
    }

    @RequireRole("ADMIN")
    @PostMapping("/init-redis")
    public ResponseEntity<ApiResponse<String>> initRedis() {
        productService.initRedis();
        return ResponseEntity.ok(ApiResponse.success("Redis stock cache primed successfully!", null));
    }
}
