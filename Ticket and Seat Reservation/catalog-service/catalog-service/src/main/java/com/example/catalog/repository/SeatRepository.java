package com.example.catalog.repository;

import com.example.catalog.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByEventEventId(Long eventId);
}
