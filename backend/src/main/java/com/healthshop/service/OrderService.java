package com.healthshop.service;

import com.healthshop.dto.OrderDTO;
import com.healthshop.model.*;
import com.healthshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponService couponService;

    @Transactional
    public OrderDTO.OrderResponse createOrder(Long userId, OrderDTO.CreateOrderRequest request) {
        System.out.println("Creating order for userId: " + userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        double totalAmount = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : cartItems) {
            Product product = ci.getProduct();
            double price = product.getDiscountPrice() != null ? product.getDiscountPrice() : product.getPrice();
            double itemTotal = price * ci.getQuantity();
            totalAmount += itemTotal;

            orderItems.add(OrderItem.builder()
                    .product(product)
                    .quantity(ci.getQuantity())
                    .unitPrice(price)
                    .totalPrice(itemTotal)
                    .build());

            // Update product purchase count
            product.setPurchaseCount(product.getPurchaseCount() + ci.getQuantity());
            productRepository.save(product);
        }

        Order order = Order.builder()
                .orderNumber("HS-" + System.currentTimeMillis())
                .user(user)
                .totalAmount(totalAmount)
                .discountAmount(0.0)
                .finalAmount(totalAmount)
                .status(Order.OrderStatus.CONFIRMED)
                .paymentStatus(Order.PaymentStatus.PAID)
                .paymentMethod(request.getPaymentMethod())
                .shippingName(request.getShippingName())
                .shippingAddress(request.getShippingAddress())
                .shippingCity(request.getShippingCity())
                .shippingState(request.getShippingState())
                .shippingZip(request.getShippingZip())
                .shippingPhone(request.getShippingPhone())
                .build();

        // Apply Coupon if present
        if (request.getCouponCode() != null && !request.getCouponCode().isEmpty()) {
            try {
                Coupon coupon = couponService.validateCoupon(request.getCouponCode(), totalAmount);
                double discount = 0;
                if (coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE) {
                    discount = (totalAmount * coupon.getDiscountValue()) / 100;
                } else {
                    discount = coupon.getDiscountValue();
                }

                // Ensure discount doesn't exceed total
                if (discount > totalAmount)
                    discount = totalAmount;

                order.setDiscountAmount(discount);
                order.setFinalAmount(totalAmount - discount);
                order.setCouponCode(request.getCouponCode());
                order.setDiscountPercentage(
                        coupon.getDiscountType() == Coupon.DiscountType.PERCENTAGE ? coupon.getDiscountValue() : 0);

            } catch (RuntimeException e) {
                // If coupon is invalid, we proceed without it or throw error?
                // Better to throw error so user knows why price matches.
                throw new RuntimeException("Failed to apply coupon: " + e.getMessage());
            }
        }

        order = orderRepository.save(order);

        for (OrderItem item : orderItems) {
            item.setOrder(order);
        }
        order.setItems(orderItems);
        order = orderRepository.save(order);

        // Clear cart
        cartItemRepository.deleteByUserId(userId);

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO.OrderResponse> getOrderHistory(Long userId, int page, int size) {
        System.out.println("Fetching order history for userId: " + userId + ", page: " + page);
        Page<OrderDTO.OrderResponse> result = orderRepository
                .findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(page, size))
                .map(this::toResponse);
        System.out.println("Found " + result.getTotalElements() + " orders for userId: " + userId);
        return result;
    }

    @Transactional(readOnly = true)
    public Page<OrderDTO.OrderResponse> getAllOrders(int page, int size) {
        System.out.println("Fetching ALL orders, page: " + page);
        return orderRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(this::toResponse);
    }

    @Transactional
    public OrderDTO.OrderResponse updateOrderStatus(Long orderId, String status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        try {
            Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
            order.setStatus(newStatus);

            // Auto-update payment status if delivered? Maybe not.
            if (newStatus == Order.OrderStatus.DELIVERED && order.getPaymentStatus() == Order.PaymentStatus.PENDING) {
                order.setPaymentStatus(Order.PaymentStatus.PAID); // Optional business logic
            }

            return toResponse(orderRepository.save(order));
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid order status: " + status);
        }
    }

    private OrderDTO.OrderResponse toResponse(Order order) {
        List<OrderDTO.OrderItemResponse> items = order.getItems().stream()
                .map(oi -> OrderDTO.OrderItemResponse.builder()
                        .productId(oi.getProduct().getId())
                        .productName(oi.getProduct().getName())
                        .productImage(oi.getProduct().getImageUrl())
                        .quantity(oi.getQuantity())
                        .unitPrice(oi.getUnitPrice())
                        .totalPrice(oi.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        return OrderDTO.OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .items(items)
                .totalAmount(order.getTotalAmount())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .status(order.getStatus().name())
                .paymentStatus(order.getPaymentStatus().name())
                .paymentMethod(order.getPaymentMethod())
                .shippingName(order.getShippingName())
                .shippingAddress(order.getShippingAddress())
                .shippingCity(order.getShippingCity())
                .shippingState(order.getShippingState())
                .shippingZip(order.getShippingZip())
                .createdAt(order.getCreatedAt())
                .build();
    }
}
