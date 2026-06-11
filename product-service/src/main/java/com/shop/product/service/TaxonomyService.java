package com.shop.product.service;

import com.shop.product.entity.Brand;
import com.shop.product.entity.Category;
import com.shop.product.repository.BrandRepository;
import com.shop.product.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaxonomyService {
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;

    public TaxonomyService(CategoryRepository categoryRepository, BrandRepository brandRepository) {
        this.categoryRepository = categoryRepository;
        this.brandRepository = brandRepository;
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category createCategory(Category category) {
        return categoryRepository.save(category);
    }

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand createBrand(Brand brand) {
        return brandRepository.save(brand);
    }
}
