package com.example.catalog.entity;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "venue")
public class Venue {

    @Id
    private Long venueId;

    private String name;
    private String city;
    private int capacity;

    @OneToMany(mappedBy = "venue")
    private List<Event> events;

    // Getters and Setters
    public Long getVenueId() { return venueId; }
    public void setVenueId(Long venueId) { this.venueId = venueId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }

    public List<Event> getEvents() { return events; }
    public void setEvents(List<Event> events) { this.events = events; }
}
