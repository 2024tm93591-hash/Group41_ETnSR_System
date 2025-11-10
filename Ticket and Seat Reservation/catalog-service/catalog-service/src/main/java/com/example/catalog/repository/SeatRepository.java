package com.example.catalog.repository;

import com.example.catalog.entity.Seat;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SeatRepository extends MongoRepository<Seat, String> {
    List<Seat> findByEventEventId(String eventId);
}
