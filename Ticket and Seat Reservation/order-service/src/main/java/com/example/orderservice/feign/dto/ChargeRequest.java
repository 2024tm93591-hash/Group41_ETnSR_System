package com.example.orderservice.feign.dto;

import java.math.BigDecimal;

public record ChargeRequest(String orderId, BigDecimal amount, String currency, String paymentMethodId) {}
