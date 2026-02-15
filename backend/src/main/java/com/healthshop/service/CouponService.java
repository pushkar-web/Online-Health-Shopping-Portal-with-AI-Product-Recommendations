package com.healthshop.service;

import com.healthshop.model.Coupon;
import com.healthshop.repository.CouponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CouponService {
    private final CouponRepository couponRepository;

    public Coupon createCoupon(Coupon coupon) {
        if (couponRepository.existsByCode(coupon.getCode())) {
            throw new RuntimeException("Coupon code already exists");
        }
        return couponRepository.save(coupon);
    }

    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }

    public Coupon validateCoupon(String code, double orderAmount) {
        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid coupon code"));

        if (!coupon.isActive()) {
            throw new RuntimeException("Coupon is inactive");
        }

        if (coupon.getExpirationDate() != null && coupon.getExpirationDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Coupon has expired");
        }

        if (coupon.getMinPurchaseAmount() != null && orderAmount < coupon.getMinPurchaseAmount()) {
            throw new RuntimeException("Minimum purchase amount not met for this coupon");
        }

        return coupon;
    }
}
