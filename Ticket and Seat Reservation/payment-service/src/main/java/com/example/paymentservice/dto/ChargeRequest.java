package com.example.paymentservice.dto;

import java.math.BigDecimal;

public record ChargeRequest(String orderId, BigDecimal amount, String currency, String paymentMethodId) {}
