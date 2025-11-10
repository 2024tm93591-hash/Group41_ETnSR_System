package com.example.catalog.service;

import com.example.catalog.entity.Venue;
import com.example.catalog.repository.VenueRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VenueService {

    private final VenueRepository repo;

    public VenueService(VenueRepository repo) {
        this.repo = repo;
    }

    // Get all venues
    public List<Venue> getAllVenues() {
        return repo.findAll();
    }

    // Find venues by city (case-insensitive)
    public List<Venue> getVenuesByCity(String city) {
        return repo.findByCityIgnoreCase(city);
    }

    // Get a venue by ID
    public Venue getVenueById(String id) {
        return repo.findById(id).orElse(null);
    }
}
