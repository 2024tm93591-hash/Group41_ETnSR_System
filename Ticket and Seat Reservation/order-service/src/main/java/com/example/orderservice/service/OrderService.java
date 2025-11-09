package com.example.orderservice.service;

import com.example.orderservice.domain.*;
import com.example.orderservice.dto.PlaceOrderRequest;
import com.example.orderservice.feign.PaymentClient;
import com.example.orderservice.feign.dto.ChargeRequest;
import com.example.orderservice.feign.dto.ChargeResponse;
import com.example.orderservice.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

@Service
public class OrderService {
    private final OrderRepository orderRepository;
    private final PaymentClient paymentClient;

    public OrderService(OrderRepository orderRepository, PaymentClient paymentClient) {
        this.orderRepository = orderRepository;
        this.paymentClient = paymentClient;
    }

    @Transactional
    public Order createOrder(PlaceOrderRequest req) {
        Order o = new Order();
        o.setUserId(req.userId);
        o.setStatus(OrderStatus.CREATED);

        BigDecimal subtotal = BigDecimal.ZERO;
        for (var line : req.lines) {
            OrderItem it = new OrderItem();
            it.setEventId(line.eventId);
            it.setSeatCode(line.seatCode);
            it.setPrice(line.price);
            it.setOrder(o);
            o.getItems().add(it);
            subtotal = subtotal.add(line.price);
        }

        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(0.05));
        BigDecimal total = subtotal.add(tax);
        o.setTotal(total);

        Order saved = orderRepository.save(o);

        // move to PENDING_PAYMENT and call payment service (synchronous example)
        saved.setStatus(OrderStatus.PENDING_PAYMENT);
        orderRepository.save(saved);

        String idempotencyKey = UUID.randomUUID().toString();
        ChargeRequest cr = new ChargeRequest(saved.getId(), saved.getTotal(), "INR", "pm_card_visa");
        ChargeResponse resp = paymentClient.charge(idempotencyKey, cr);

        if ("SUCCESS".equalsIgnoreCase(resp.status())) {
            saved.setStatus(OrderStatus.CONFIRMED);
            orderRepository.save(saved);
            // generate tickets (delegated to ticketing or same service)
        } else {
            saved.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(saved);
        }

        return saved;
    }

	public Optional<Order> findById(Long id) {
		// TODO Auto-generated method stub
		return orderRepository.findById(id);
		//return null;
	}
}
