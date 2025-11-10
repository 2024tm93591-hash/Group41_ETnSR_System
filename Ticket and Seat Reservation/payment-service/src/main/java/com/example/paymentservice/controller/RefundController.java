package com.example.paymentservice.controller;

import com.example.paymentservice.domain.Payment;
import com.example.paymentservice.domain.PaymentStatus;
import com.example.paymentservice.repository.PaymentRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/v1/refunds")
public class RefundController {
    private final PaymentRepository paymentRepository;

    public RefundController(PaymentRepository paymentRepository) { this.paymentRepository = paymentRepository; }

    @PostMapping("/{paymentId}")
    public ResponseEntity<?> refund(@PathVariable String paymentId) {
        Optional<Payment> pOpt = paymentRepository.findById(paymentId);
            if (pOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
        Payment p = pOpt.get();
        if (p.getStatus() != PaymentStatus.SUCCESS) return ResponseEntity.badRequest().body("Only successful payments can be refunded");
        p.setStatus(PaymentStatus.REFUNDED);
        paymentRepository.save(p);
        return ResponseEntity.ok("Refunded");
    }
}