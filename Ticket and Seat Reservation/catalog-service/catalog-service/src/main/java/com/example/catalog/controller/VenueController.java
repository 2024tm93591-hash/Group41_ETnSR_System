package com.example.catalog.controller;

import com.example.catalog.entity.Venue;
import com.example.catalog.repository.VenueRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/venues")
public class VenueController {

    private final VenueRepository venueRepository;

    public VenueController(VenueRepository venueRepository) {
        this.venueRepository = venueRepository;
    }

    @GetMapping
    public List<Venue> getAllVenues() { return venueRepository.findAll(); }

    @GetMapping("/{id}")
       public Venue getVenueById(@PathVariable String id) {
           return venueRepository.findById(id).orElse(null);
       }

    @GetMapping("/city/{city}")
    public List<Venue> getVenuesByCity(@PathVariable String city) {
        return venueRepository.findByCityIgnoreCase(city);
    }

    @PostMapping
    public Venue createVenue(@RequestBody Venue venue) {
        return venueRepository.save(venue);
    }

    @PutMapping("/{id}")
       public Venue updateVenue(@PathVariable String id, @RequestBody Venue venueDetails) {
           Venue venue = venueRepository.findById(id).orElseThrow();
        venue.setName(venueDetails.getName());
        venue.setCity(venueDetails.getCity());
        venue.setCapacity(venueDetails.getCapacity());
        return venueRepository.save(venue);
    }

    @DeleteMapping("/{id}")
       public void deleteVenue(@PathVariable String id) {
           venueRepository.deleteById(id);
       }
}
