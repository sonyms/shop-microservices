package com.shop.product.service;

import com.shop.common.dto.ProductResponseDto;
import com.shop.product.entity.Brand;
import com.shop.product.entity.Category;
import com.shop.product.entity.Product;
import com.shop.product.dto.ProductRequestDto;
import com.shop.common.dto.ReserveStockRequestDto;
import com.shop.common.exception.ResourceNotFoundException;
import com.shop.common.exception.BaseException;
import com.shop.product.repository.ProductRepository;
import com.shop.product.strategy.StockReservationStrategy;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final StockReservationStrategy databaseStrategy;
    private final StockReservationStrategy redisStrategy;
    private final ProductRepository repository;
    private final StringRedisTemplate redisTemplate;

    private volatile boolean useRedis = false; // Default to DB strategy

    public ProductServiceImpl(@Qualifier("databaseStrategy") StockReservationStrategy databaseStrategy,
                          @Qualifier("redisStrategy") StockReservationStrategy redisStrategy,
                          ProductRepository repository,
                          StringRedisTemplate redisTemplate) {
        this.databaseStrategy = databaseStrategy;
        this.redisStrategy = redisStrategy;
        this.repository = repository;
        this.redisTemplate = redisTemplate;
    }

    public void setUseRedis(boolean useRedis) {
        this.useRedis = useRedis;
    }

    public boolean isUseRedis() {
        return useRedis;
    }

    @Transactional
    @CacheEvict(value = "products", allEntries = true)
    public List<ProductResponseDto> reserveStock(ReserveStockRequestDto dto) {
        List<Product> reserved = useRedis ? redisStrategy.reserveStock(dto.getItems()) : databaseStrategy.reserveStock(dto.getItems());
        return reserved.stream().map(this::mapToDto).toList();
    }

    @Cacheable(value = "products_page", key = "#pageable.pageNumber + '-' + #pageable.pageSize", sync = true)
    public Page<ProductResponseDto> getAllProducts(Pageable pageable) {
        Page<ProductResponseDto> page = repository.findAll(pageable).map(this::mapToDto);
        return new com.shop.product.dto.CustomPageImpl<>(page.getContent(), pageable, page.getTotalElements());
    }

    @Cacheable(value = "products", key = "#id", sync = true)
    public ProductResponseDto getProduct(Long id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
        return mapToDto(product);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "products", allEntries = true),
        @CacheEvict(value = "products_page", allEntries = true)
    })
    public ProductResponseDto createProduct(ProductRequestDto dto) {
        Product product = new Product();
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        if (dto.getCategory() != null && dto.getCategory().getId() != null) {
            Category category = new Category();
            category.setId(dto.getCategory().getId());
            product.setCategory(category);
        }
        if (dto.getBrand() != null && dto.getBrand().getId() != null) {
            Brand brand = new Brand();
            brand.setId(dto.getBrand().getId());
            product.setBrand(brand);
        }

        Product saved = repository.save(product);
        redisTemplate.opsForValue().set("product:stock:" + saved.getId(), String.valueOf(saved.getStockQuantity()));
        return mapToDto(saved);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "products", allEntries = true),
        @CacheEvict(value = "products_page", allEntries = true)
    })
    public ProductResponseDto updateProduct(Long id, ProductRequestDto productDetails) {
        Product existing = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Product", id));
        existing.setName(productDetails.getName());
        existing.setDescription(productDetails.getDescription());
        existing.setPrice(productDetails.getPrice());
        existing.setStockQuantity(productDetails.getStockQuantity());
        if (productDetails.getImageUrl() != null) {
            existing.setImageUrl(productDetails.getImageUrl());
        }
        if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null) {
            Category category = new Category();
            category.setId(productDetails.getCategory().getId());
            existing.setCategory(category);
        }
        if (productDetails.getBrand() != null && productDetails.getBrand().getId() != null) {
            Brand brand = new Brand();
            brand.setId(productDetails.getBrand().getId());
            existing.setBrand(brand);
        }
        Product saved = repository.save(existing);
        redisTemplate.opsForValue().set("product:stock:" + saved.getId(), String.valueOf(saved.getStockQuantity()));
        return mapToDto(saved);
    }

    @Transactional
    @Caching(evict = {
        @CacheEvict(value = "products", allEntries = true),
        @CacheEvict(value = "products_page", allEntries = true)
    })
    public void deleteProduct(Long id) {
        repository.deleteById(id);
        redisTemplate.delete("product:stock:" + id);
    }

    public void initRedis() {
        List<Product> allProducts = repository.findAll();
        for (Product p : allProducts) {
            redisTemplate.opsForValue().set("product:stock:" + p.getId(), String.valueOf(p.getStockQuantity()));
        }
    }

    public String uploadImage(MultipartFile file) {
        try {
            String uploadDir = System.getProperty("user.dir") + "/uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir + fileName);
            Files.write(filePath, file.getBytes());

            return "/uploads/" + fileName;
        } catch (IOException e) {
            throw new BaseException("FILE_UPLOAD_ERROR", "Could not upload file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private ProductResponseDto mapToDto(Product p) {
        return new ProductResponseDto(p.getId(), p.getName(), p.getDescription(), p.getPrice(), p.getStockQuantity(), p.getImageUrl(), p.getCategory(), p.getBrand());
    }
}
