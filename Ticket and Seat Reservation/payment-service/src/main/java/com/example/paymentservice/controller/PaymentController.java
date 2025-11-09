package com.example.paymentservice.controller;

import com.example.paymentservice.dto.ChargeRequest;
import com.example.paymentservice.dto.ChargeResponse;
import com.example.paymentservice.domain.Payment;
import com.example.paymentservice.domain.PaymentStatus;
import com.example.paymentservice.repository.PaymentRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/v1/charges")
public class PaymentController {
    private final PaymentRepository paymentRepository;

    public PaymentController(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    @PostMapping
    @Transactional
    public ResponseEntity<ChargeResponse> charge(
            @RequestHeader(value = "Idempotency-Key", required = false) String idempotencyKey,
            @RequestBody ChargeRequest req) {

        if (idempotencyKey == null || idempotencyKey.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ChargeResponse(null, "FAILED", "Missing Idempotency-Key header"));
        }

        Optional<Payment> existing = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existing.isPresent()) {
            Payment p = existing.get();
            return ResponseEntity.ok(new ChargeResponse(String.valueOf(p.getId()), p.getStatus().name(), "idempotent-result"));
        }

        // create PENDING payment record
        Payment payment = new Payment();
        payment.setOrderId(req.orderId());
        payment.setAmount(req.amount());
        payment.setCurrency(req.currency());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setIdempotencyKey(idempotencyKey);
        paymentRepository.save(payment);

        // Simulate communication with payment gateway (synchronous for demo)
        boolean gatewayOk = simulateGatewayCharge(req);
        if (gatewayOk) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setGatewayChargeId("gw_" + UUID.randomUUID());
            paymentRepository.save(payment);
            return ResponseEntity.ok(new ChargeResponse(String.valueOf(payment.getId()), "SUCCESS", "Charged successfully"));
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(new ChargeResponse(String.valueOf(payment.getId()), "FAILED", "Gateway failed"));
        }
    }

    private boolean simulateGatewayCharge(ChargeRequest req) {
        // For demo: succeed for amounts < 1,00,000, otherwise fail
        return req.amount().doubleValue() < 100000;
    }
}
