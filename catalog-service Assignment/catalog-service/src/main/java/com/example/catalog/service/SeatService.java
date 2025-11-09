package com.example.catalog.service;

import com.example.catalog.entity.Seat;
import com.example.catalog.repository.SeatRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SeatService {

    private final SeatRepository seatRepository;

    public SeatService(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    // Get all seats
    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    // Get seat by ID
    public Optional<Seat> getSeatById(Long id) {
        return seatRepository.findById(id);
    }

    // Get all seats by event ID
    public List<Seat> getSeatsByEventId(Long eventId) {
        return seatRepository.findByEventEventId(eventId);
    }

    // Create new seat
    public Seat createSeat(Seat seat) {
        return seatRepository.save(seat);
    }

    // Update existing seat
    public Seat updateSeat(Long id, Seat seatDetails) {
        Seat seat = seatRepository.findById(id).orElseThrow(() -> 
            new RuntimeException("Seat not found with id " + id)
        );
        seat.setSection(seatDetails.getSection());
        seat.setSeatRow(seatDetails.getSeatRow());
        seat.setSeatNumber(seatDetails.getSeatNumber());
        seat.setPrice(seatDetails.getPrice());
        seat.setEvent(seatDetails.getEvent());
        return seatRepository.save(seat);
    }

    // Delete seat by ID
    public void deleteSeat(Long id) {
        seatRepository.deleteById(id);
    }
}
