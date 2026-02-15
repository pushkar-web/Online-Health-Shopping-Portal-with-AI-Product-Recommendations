package com.healthshop.service;

import com.healthshop.dto.ProductDTO;
import com.healthshop.model.Product;
import com.healthshop.model.User;
import com.healthshop.model.WishlistItem;
import com.healthshop.repository.ProductRepository;
import com.healthshop.repository.UserRepository;
import com.healthshop.repository.WishlistItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistItemRepository wishlistRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<ProductDTO.ProductResponse> getWishlist(Long userId) {
        return wishlistRepository.findByUserId(userId).stream()
                .map(item -> productService.toResponse(item.getProduct()))
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO.ProductResponse addToWishlist(Long userId, Long productId) {
        if (wishlistRepository.existsByUserIdAndProductId(userId, productId)) {
            Product product = productRepository.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found"));
            return productService.toResponse(product);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        WishlistItem item = WishlistItem.builder()
                .user(user)
                .product(product)
                .build();
        wishlistRepository.save(item);

        return productService.toResponse(product);
    }

    @Transactional
    public void removeFromWishlist(Long userId, Long productId) {
        wishlistRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(wishlistRepository::delete);
    }

    public boolean isInWishlist(Long userId, Long productId) {
        return wishlistRepository.existsByUserIdAndProductId(userId, productId);
    }
}
