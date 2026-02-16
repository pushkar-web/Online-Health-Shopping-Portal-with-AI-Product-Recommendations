package com.healthshop.controller;

import com.healthshop.dto.ProductDTO;

import com.healthshop.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog with search and filters")
public class ProductController {

    private final ProductService productService;

    @GetMapping
    @Operation(summary = "Get products with filters and pagination")
    public ResponseEntity<Page<ProductDTO.ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String healthGoal,
            @RequestParam(required = false) String ageGroup,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "12") Integer size) {

        ProductDTO.ProductFilterRequest filter = new ProductDTO.ProductFilterRequest();
        filter.setSearch(search);
        filter.setCategoryId(categoryId);
        filter.setHealthGoal(healthGoal);
        filter.setAgeGroup(ageGroup);
        filter.setMinPrice(minPrice);
        filter.setMaxPrice(maxPrice);
        filter.setSortBy(sortBy);
        filter.setSortDir(sortDir);
        filter.setPage(page);
        filter.setSize(size);

        return ResponseEntity.ok(productService.getProducts(filter));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public ResponseEntity<ProductDTO.ProductResponse> getProduct(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Get product by slug")
    public ResponseEntity<ProductDTO.ProductResponse> getProductBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(productService.getProductBySlug(slug));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured products")
    public ResponseEntity<List<ProductDTO.ProductResponse>> getFeatured() {
        return ResponseEntity.ok(productService.getFeaturedProducts());
    }

    @GetMapping("/trending")
    @Operation(summary = "Get trending products")
    public ResponseEntity<List<ProductDTO.ProductResponse>> getTrending() {
        return ResponseEntity.ok(productService.getTrendingProducts());
    }

    @GetMapping("/new-arrivals")
    @Operation(summary = "Get new arrivals")
    public ResponseEntity<List<ProductDTO.ProductResponse>> getNewArrivals() {
        return ResponseEntity.ok(productService.getNewArrivals());
    }

    @GetMapping("/health-goal/{goal}")
    @Operation(summary = "Get products by health goal")
    public ResponseEntity<List<ProductDTO.ProductResponse>> getByHealthGoal(@PathVariable String goal) {
        return ResponseEntity.ok(productService.getProductsByHealthGoal(goal));
    }
}
