package com.example.orderservice.feign.dto;

import java.math.BigDecimal;

public record ChargeRequest(Long orderId, BigDecimal amount, String currency, String paymentMethodId) {}
