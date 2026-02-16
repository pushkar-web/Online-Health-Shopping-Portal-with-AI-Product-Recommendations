package com.healthshop.service;

import com.healthshop.dto.OrderDTO;
import com.healthshop.model.*;
import com.healthshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public List<OrderDTO.CartItemResponse> getCart(Long userId) {
        return cartItemRepository.findByUserId(userId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public OrderDTO.CartItemResponse addToCart(Long userId, OrderDTO.CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existing = cartItemRepository.findByUserIdAndProductId(userId, request.getProductId());

        CartItem cartItem;
        if (existing.isPresent()) {
            cartItem = existing.get();
            cartItem.setQuantity(cartItem.getQuantity() + (request.getQuantity() != null ? request.getQuantity() : 1));
        } else {
            cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity() != null ? request.getQuantity() : 1)
                    .build();
        }

        cartItem = cartItemRepository.save(cartItem);
        return toResponse(cartItem);
    }

    public OrderDTO.CartItemResponse updateCartItem(Long userId, Long itemId, Integer quantity) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
            return null;
        }

        cartItem.setQuantity(quantity);
        cartItem = cartItemRepository.save(cartItem);
        return toResponse(cartItem);
    }

    public void removeFromCart(Long userId, Long itemId) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (!cartItem.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        cartItemRepository.delete(cartItem);
    }

    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    private OrderDTO.CartItemResponse toResponse(CartItem ci) {
        Product p = ci.getProduct();
        double price = p.getDiscountPrice() != null ? p.getDiscountPrice() : p.getPrice();
        return OrderDTO.CartItemResponse.builder()
                .id(ci.getId())
                .productId(p.getId())
                .productName(p.getName())
                .productImage(p.getImageUrl())
                .productPrice(p.getPrice())
                .productDiscountPrice(p.getDiscountPrice())
                .quantity(ci.getQuantity())
                .totalPrice(price * ci.getQuantity())
                .build();
    }
}
