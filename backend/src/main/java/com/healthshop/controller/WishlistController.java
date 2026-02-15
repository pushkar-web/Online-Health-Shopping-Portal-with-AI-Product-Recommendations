package com.healthshop.controller;

import com.healthshop.dto.ProductDTO;
import com.healthshop.model.User;
import com.healthshop.repository.UserRepository;
import com.healthshop.service.WishlistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
@Tag(name = "Wishlist", description = "User wishlist management")
public class WishlistController {

    private final WishlistService wishlistService;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Get user's wishlist")
    public ResponseEntity<List<ProductDTO.ProductResponse>> getWishlist(Authentication auth) {
        return ResponseEntity.ok(wishlistService.getWishlist(getUserId(auth)));
    }

    @PostMapping("/{productId}")
    @Operation(summary = "Add product to wishlist")
    public ResponseEntity<ProductDTO.ProductResponse> addToWishlist(
            Authentication auth, @PathVariable("productId") Long productId) {
        return ResponseEntity.ok(wishlistService.addToWishlist(getUserId(auth), productId));
    }

    @DeleteMapping("/{productId}")
    @Operation(summary = "Remove product from wishlist")
    public ResponseEntity<Void> removeFromWishlist(
            Authentication auth, @PathVariable("productId") Long productId) {
        wishlistService.removeFromWishlist(getUserId(auth), productId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/check/{productId}")
    @Operation(summary = "Check if product is in wishlist")
    public ResponseEntity<Boolean> isInWishlist(
            Authentication auth, @PathVariable("productId") Long productId) {
        return ResponseEntity.ok(wishlistService.isInWishlist(getUserId(auth), productId));
    }

    private Long getUserId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
