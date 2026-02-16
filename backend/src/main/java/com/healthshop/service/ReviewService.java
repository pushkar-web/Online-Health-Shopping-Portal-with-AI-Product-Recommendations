package com.healthshop.service;

import com.healthshop.dto.ReviewDTO;
import com.healthshop.model.*;
import com.healthshop.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public Page<ReviewDTO.ReviewResponse> getProductReviews(Long productId, int page, int size) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId, PageRequest.of(page, size))
                .map(this::toResponse);
    }

    public ReviewDTO.ReviewResponse createReview(Long userId, ReviewDTO.CreateReviewRequest request) {
        if (reviewRepository.existsByUserIdAndProductId(userId, request.getProductId())) {
            throw new RuntimeException("You have already reviewed this product");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = Review.builder()
                .user(user)
                .product(product)
                .rating(request.getRating())
                .title(request.getTitle())
                .comment(request.getComment())
                .verified(false)
                .build();

        review = reviewRepository.save(review);

        // Update product rating
        Double avg = reviewRepository.getAverageRatingByProductId(product.getId());
        product.setAverageRating(avg != null ? avg : 0.0);
        product.setReviewCount(product.getReviewCount() + 1);
        productRepository.save(product);

        return toResponse(review);
    }

    private ReviewDTO.ReviewResponse toResponse(Review r) {
        return ReviewDTO.ReviewResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .userName(r.getUser().getFirstName() + " "
                        + (r.getUser().getLastName() != null ? r.getUser().getLastName() : ""))
                .userAvatar(r.getUser().getAvatarUrl())
                .productId(r.getProduct().getId())
                .rating(r.getRating())
                .title(r.getTitle())
                .comment(r.getComment())
                .verified(r.getVerified())
                .helpfulCount(r.getHelpfulCount())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
