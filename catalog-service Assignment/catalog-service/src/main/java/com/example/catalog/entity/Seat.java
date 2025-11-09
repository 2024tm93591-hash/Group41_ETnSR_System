package com.example.catalog.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "seat")
public class Seat {

    @Id
    private Long seatId;

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;

    private String section;

    @Column(name = "seat_row") // renamed from row to seat_row to avoid H2 keyword conflict
    private String seatRow;

    private String seatNumber;
    private double price;

    // Getters and Setters
    public Long getSeatId() {
        return seatId;
    }

    public void setSeatId(Long seatId) {
        this.seatId = seatId;
    }

    public Event getEvent() {
        return event;
    }

    public void setEvent(Event event) {
        this.event = event;
    }

    public String getSection() {
        return section;
    }

    public void setSection(String section) {
        this.section = section;
    }

    public String getSeatRow() {
        return seatRow;
    }

    public void setSeatRow(String seatRow) {
        this.seatRow = seatRow;
    }

    public String getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(String seatNumber) {
        this.seatNumber = seatNumber;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }
}
