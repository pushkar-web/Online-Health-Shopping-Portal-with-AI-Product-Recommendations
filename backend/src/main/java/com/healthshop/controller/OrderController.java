package com.healthshop.controller;

import com.healthshop.dto.OrderDTO;
import com.healthshop.model.User;
import com.healthshop.repository.UserRepository;
import com.healthshop.service.CartService;
import com.healthshop.service.OrderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Cart & Orders", description = "Shopping cart and order management")
public class OrderController {

    private final CartService cartService;
    private final OrderService orderService;
    private final UserRepository userRepository;

    // ===== CART =====

    @GetMapping("/cart")
    @Operation(summary = "Get user's cart")
    public ResponseEntity<List<OrderDTO.CartItemResponse>> getCart(Authentication auth) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/cart")
    @Operation(summary = "Add item to cart")
    public ResponseEntity<OrderDTO.CartItemResponse> addToCart(
            Authentication auth, @RequestBody OrderDTO.CartItemRequest request) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(cartService.addToCart(userId, request));
    }

    @PutMapping("/cart/{itemId}")
    @Operation(summary = "Update cart item quantity")
    public ResponseEntity<OrderDTO.CartItemResponse> updateCartItem(
            Authentication auth, @PathVariable Long itemId, @RequestParam Integer quantity) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(cartService.updateCartItem(userId, itemId, quantity));
    }

    @DeleteMapping("/cart/{itemId}")
    @Operation(summary = "Remove item from cart")
    public ResponseEntity<Void> removeFromCart(Authentication auth, @PathVariable Long itemId) {
        Long userId = getUserId(auth);
        cartService.removeFromCart(userId, itemId);
        return ResponseEntity.ok().build();
    }

    // ===== ORDERS =====

    @PostMapping("/orders")
    @Operation(summary = "Place an order from cart items")
    public ResponseEntity<OrderDTO.OrderResponse> createOrder(
            Authentication auth, @RequestBody OrderDTO.CreateOrderRequest request) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(orderService.createOrder(userId, request));
    }

    @GetMapping("/orders/history")
    @Operation(summary = "Get order history")
    public ResponseEntity<Page<OrderDTO.OrderResponse>> getOrderHistory(
            Authentication auth,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Long userId = getUserId(auth);
        return ResponseEntity.ok(orderService.getOrderHistory(userId, page, size));
    }

    // ===== ADMIN =====

    @GetMapping("/admin/orders")
    @Operation(summary = "Get all orders (Admin)")
    public ResponseEntity<Page<OrderDTO.OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size));
    }

    @PutMapping("/admin/orders/{id}/status")
    @Operation(summary = "Update order status (Admin)")
    public ResponseEntity<OrderDTO.OrderResponse> updateOrderStatus(
            @PathVariable("id") Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
    }

    private Long getUserId(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}
