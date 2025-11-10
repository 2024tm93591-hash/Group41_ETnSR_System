package com.example.paymentservice.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Document(collection = "payments")
public class Payment {
	@Id
	private String id;

	private String orderId;
	private BigDecimal amount;
	private String currency;

	private PaymentStatus status;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getOrderId() {
		return orderId;
	}

	public void setOrderId(String orderId) {
		this.orderId = orderId;
	}

	public BigDecimal getAmount() {
		return amount;
	}

	public void setAmount(BigDecimal amount) {
		this.amount = amount;
	}

	public String getCurrency() {
		return currency;
	}

	public void setCurrency(String currency) {
		this.currency = currency;
	}

	public PaymentStatus getStatus() {
		return status;
	}

	public void setStatus(PaymentStatus status) {
		this.status = status;
	}

	public String getGatewayChargeId() {
		return gatewayChargeId;
	}

	public void setGatewayChargeId(String gatewayChargeId) {
		this.gatewayChargeId = gatewayChargeId;
	}

	public String getIdempotencyKey() {
		return idempotencyKey;
	}

	public void setIdempotencyKey(String idempotencyKey) {
		this.idempotencyKey = idempotencyKey;
	}

	public OffsetDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(OffsetDateTime createdAt) {
		this.createdAt = createdAt;
	}

	private String gatewayChargeId; // external gateway id if any

    private String idempotencyKey;

    private OffsetDateTime createdAt = OffsetDateTime.now();

}
