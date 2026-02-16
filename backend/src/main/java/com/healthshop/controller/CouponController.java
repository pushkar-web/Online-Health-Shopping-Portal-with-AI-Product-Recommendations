package com.healthshop.controller;

import com.healthshop.model.Coupon;
import com.healthshop.service.CouponService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Coupons", description = "Coupon management")
public class CouponController {

    private final CouponService couponService;

    @GetMapping("/admin/coupons")
    @Operation(summary = "Get all coupons (Admin)")
    public ResponseEntity<List<Coupon>> getAllCoupons() {
        return ResponseEntity.ok(couponService.getAllCoupons());
    }

    @PostMapping("/admin/coupons")
    @Operation(summary = "Create coupon (Admin)")
    public ResponseEntity<Coupon> createCoupon(@RequestBody Coupon coupon) {
        return ResponseEntity.ok(couponService.createCoupon(coupon));
    }

    @DeleteMapping("/admin/coupons/{id}")
    @Operation(summary = "Delete coupon (Admin)")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/coupons/validate")
    @Operation(summary = "Validate coupon")
    public ResponseEntity<Coupon> validateCoupon(@RequestBody Map<String, Object> req) {
        String code = (String) req.get("code");
        Double amount = Double.parseDouble(req.get("amount").toString());
        return ResponseEntity.ok(couponService.validateCoupon(code, amount));
    }
}
