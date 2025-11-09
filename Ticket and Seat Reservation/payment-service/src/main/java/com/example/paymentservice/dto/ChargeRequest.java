package com.example.paymentservice.dto;

import java.math.BigDecimal;

public record ChargeRequest(Long orderId, BigDecimal amount, String currency, String paymentMethodId) {}
