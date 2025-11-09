package com.example.catalog.controller;

import com.example.catalog.entity.Seat;
import com.example.catalog.repository.SeatRepository;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    private final SeatRepository seatRepository;

    public SeatController(SeatRepository seatRepository) {
        this.seatRepository = seatRepository;
    }

    @GetMapping
    public List<Seat> getAllSeats() {
        return seatRepository.findAll();
    }

    @GetMapping("/{id}")
    public Seat getSeatById(@PathVariable Long id) {
        return seatRepository.findById(id).orElse(null);
    }

    @GetMapping("/event/{eventId}")
    public List<Seat> getSeatsByEvent(@PathVariable Long eventId) {
        return seatRepository.findByEventEventId(eventId);
    }

    // ✅ NEW ENDPOINT – used by other services (Python/.NET)
    @GetMapping("/info")
    public List<Seat> getSeatsInfo(@RequestParam("seatIds") String seatIds) {
        List<Long> ids = Arrays.stream(seatIds.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(Long::parseLong)
                .collect(Collectors.toList());
        return seatRepository.findAllById(ids);
    }

    @PostMapping
    public Seat createSeat(@RequestBody Seat seat) {
        return seatRepository.save(seat);
    }

    @PutMapping("/{id}")
    public Seat updateSeat(@PathVariable Long id, @RequestBody Seat seatDetails) {
        Seat seat = seatRepository.findById(id).orElseThrow();
        seat.setSection(seatDetails.getSection());
        seat.setSeatRow(seatDetails.getSeatRow());
        seat.setSeatNumber(seatDetails.getSeatNumber());
        seat.setPrice(seatDetails.getPrice());
        seat.setEvent(seatDetails.getEvent());
        return seatRepository.save(seat);
    }

    @DeleteMapping("/{id}")
    public void deleteSeat(@PathVariable Long id) {
        seatRepository.deleteById(id);
    }
}
