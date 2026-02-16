package com.healthshop.service;

import com.healthshop.dto.ProductDTO;
import com.healthshop.model.Product;
import com.healthshop.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductDTO.ProductResponse> getProducts(ProductDTO.ProductFilterRequest filter) {
        int page = filter.getPage() != null ? filter.getPage() : 0;
        int size = filter.getSize() != null ? filter.getSize() : 12;

        Sort sort = Sort.by(Sort.Direction.DESC, "createdAt");
        if (filter.getSortBy() != null) {
            switch (filter.getSortBy()) {
                case "price" -> sort = Sort.by(Sort.Direction.ASC, "price");
                case "price_desc" -> sort = Sort.by(Sort.Direction.DESC, "price");
                case "rating" -> sort = Sort.by(Sort.Direction.DESC, "averageRating");
                case "popularity" -> sort = Sort.by(Sort.Direction.DESC, "purchaseCount");
                case "newest" -> sort = Sort.by(Sort.Direction.DESC, "createdAt");
                default -> sort = Sort.by(Sort.Direction.DESC, "createdAt");
            }
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> products;
        if (filter.getSearch() != null && !filter.getSearch().isBlank()) {
            products = productRepository.searchProducts(filter.getSearch(), pageable);
        } else if (filter.getCategoryId() != null) {
            products = productRepository.findByCategoryId(filter.getCategoryId(), pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(this::toResponse);
    }

    @Transactional
    public ProductDTO.ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        product.setViewCount(product.getViewCount() + 1);
        productRepository.save(product);
        return toResponse(product);
    }

    public ProductDTO.ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return toResponse(product);
    }

    public List<ProductDTO.ProductResponse> getFeaturedProducts() {
        return productRepository.findByFeaturedTrueAndActiveTrue()
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductDTO.ProductResponse> getTrendingProducts() {
        return productRepository.findTrendingProducts(PageRequest.of(0, 12))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductDTO.ProductResponse> getNewArrivals() {
        return productRepository.findNewArrivals(PageRequest.of(0, 12))
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<ProductDTO.ProductResponse> getProductsByHealthGoal(String goal) {
        return productRepository.findByHealthGoal(goal)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public ProductDTO.ProductResponse toResponse(Product p) {
        return ProductDTO.ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .ingredients(p.getIngredients())
                .benefits(p.getBenefits())
                .price(p.getPrice())
                .discountPrice(p.getDiscountPrice())
                .stock(p.getStock())
                .brand(p.getBrand())
                .imageUrl(p.getImageUrl())
                .images(p.getImages() != null ? Arrays.asList(p.getImages().split(",")) : List.of())
                .categoryId(p.getCategory() != null ? p.getCategory().getId() : null)
                .categoryName(p.getCategory() != null ? p.getCategory().getName() : null)
                .tags(p.getTags() != null ? Arrays.asList(p.getTags().split(",")) : List.of())
                .healthGoals(p.getHealthGoals() != null ? Arrays.asList(p.getHealthGoals().split(",")) : List.of())
                .suitableAgeGroups(p.getSuitableAgeGroups())
                .dietaryInfo(p.getDietaryInfo())
                .allergenInfo(p.getAllergenInfo())
                .dosage(p.getDosage())
                .averageRating(p.getAverageRating())
                .reviewCount(p.getReviewCount())
                .purchaseCount(p.getPurchaseCount())
                .featured(p.getFeatured())
                .build();
    }
}
