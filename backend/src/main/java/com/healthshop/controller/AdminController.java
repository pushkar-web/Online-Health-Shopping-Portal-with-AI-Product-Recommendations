package com.healthshop.controller;

import com.healthshop.dto.ProductDTO;
import com.healthshop.model.Category;
import com.healthshop.model.Product;
import com.healthshop.repository.*;
import com.healthshop.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin dashboard and management endpoints")
public class AdminController {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final CategoryRepository categoryRepository;
    private final ProductService productService;

    @GetMapping("/stats")
    @Operation(summary = "Get admin dashboard stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalOrders", orderRepository.count());

        Double revenue = orderRepository.findAll().stream()
                .mapToDouble(o -> o.getFinalAmount() != null ? o.getFinalAmount() : 0.0)
                .sum();
        stats.put("totalRevenue", Math.round(revenue * 100.0) / 100.0);

        // Category distribution
        List<Map<String, Object>> categoryStats = categoryRepository.findAll().stream()
                .map(cat -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("name", cat.getName());
                    m.put("count", productRepository.findByCategoryId(cat.getId(),
                            PageRequest.of(0, 1)).getTotalElements());
                    return m;
                })
                .collect(Collectors.toList());
        stats.put("categoryDistribution", categoryStats);

        // Recent 10 products
        stats.put("recentProducts", productRepository.findNewArrivals(PageRequest.of(0, 5))
                .stream().map(productService::toResponse).collect(Collectors.toList()));

        return ResponseEntity.ok(stats);
    }

    @PostMapping("/products")
    @Operation(summary = "Create a new product")
    public ResponseEntity<ProductDTO.ProductResponse> createProduct(@RequestBody ProductDTO.ProductCreateRequest req) {
        Category category = null;
        if (req.getCategoryId() != null) {
            category = categoryRepository.findById(req.getCategoryId()).orElse(null);
        }

        Product product = Product.builder()
                .name(req.getName())
                .slug(req.getName().toLowerCase().replaceAll("[^a-z0-9]+", "-"))
                .description(req.getDescription())
                .ingredients(req.getIngredients())
                .benefits(req.getBenefits())
                .price(req.getPrice())
                .discountPrice(req.getDiscountPrice())
                .stock(req.getStock() != null ? req.getStock() : 100)
                .brand(req.getBrand())
                .imageUrl(req.getImageUrl())
                .category(category)
                .healthGoals(req.getHealthGoals())
                .dietaryInfo(req.getDietaryInfo())
                .tags(req.getTags())
                .featured(req.getFeatured() != null ? req.getFeatured() : false)
                .build();

        product = productRepository.save(product);
        return ResponseEntity.ok(productService.toResponse(product));
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update an existing product")
    public ResponseEntity<ProductDTO.ProductResponse> updateProduct(
            @PathVariable Long id, @RequestBody ProductDTO.ProductCreateRequest req) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (req.getName() != null)
            product.setName(req.getName());
        if (req.getDescription() != null)
            product.setDescription(req.getDescription());
        if (req.getIngredients() != null)
            product.setIngredients(req.getIngredients());
        if (req.getBenefits() != null)
            product.setBenefits(req.getBenefits());
        if (req.getPrice() != null)
            product.setPrice(req.getPrice());
        if (req.getDiscountPrice() != null)
            product.setDiscountPrice(req.getDiscountPrice());
        if (req.getStock() != null)
            product.setStock(req.getStock());
        if (req.getBrand() != null)
            product.setBrand(req.getBrand());
        if (req.getImageUrl() != null)
            product.setImageUrl(req.getImageUrl());
        if (req.getHealthGoals() != null)
            product.setHealthGoals(req.getHealthGoals());
        if (req.getDietaryInfo() != null)
            product.setDietaryInfo(req.getDietaryInfo());
        if (req.getTags() != null)
            product.setTags(req.getTags());
        if (req.getFeatured() != null)
            product.setFeatured(req.getFeatured());
        if (req.getCategoryId() != null) {
            categoryRepository.findById(req.getCategoryId()).ifPresent(product::setCategory);
        }

        product = productRepository.save(product);
        return ResponseEntity.ok(productService.toResponse(product));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete a product")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/users")
    @Operation(summary = "Get all users")
    public ResponseEntity<List<com.healthshop.dto.AuthDTO.UserResponse>> getAllUsers() {
        List<com.healthshop.dto.AuthDTO.UserResponse> users = userRepository.findAll().stream()
                .map(u -> com.healthshop.dto.AuthDTO.UserResponse.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .firstName(u.getFirstName())
                        .lastName(u.getLastName())
                        .phone(u.getPhone())
                        .avatarUrl(u.getAvatarUrl())
                        .role(u.getRole().name())
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
