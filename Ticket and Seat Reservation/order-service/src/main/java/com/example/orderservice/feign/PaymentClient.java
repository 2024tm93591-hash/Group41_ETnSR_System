package com.example.orderservice.feign;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import com.example.orderservice.feign.dto.ChargeRequest;
import com.example.orderservice.feign.dto.ChargeResponse;

@FeignClient(name = "payment-service", url = "${payment.service.url}")
public interface PaymentClient {
    @PostMapping("/v1/charges")
    ChargeResponse charge(@RequestHeader("Idempotency-Key") String idempotencyKey, @RequestBody ChargeRequest req);
}
