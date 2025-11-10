package com.example.orderservice.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.orderservice.domain.Order;

public interface OrderRepository extends MongoRepository<Order, String> {}


