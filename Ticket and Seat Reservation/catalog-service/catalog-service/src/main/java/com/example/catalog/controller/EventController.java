package com.example.catalog.controller;

import com.example.catalog.entity.Event;
import com.example.catalog.repository.EventRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventRepository eventRepository;

    public EventController(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @GetMapping
    public List<Event> getEvents(@RequestParam(required = false) String city,
                                 @RequestParam(required = false) String type,
                                 @RequestParam(required = false) String status) {
        return eventRepository.findAll().stream()
                .filter(e -> city == null || e.getVenue().getCity().equalsIgnoreCase(city))
                .filter(e -> type == null || 
                        (e.getEventType() != null && e.getEventType().equalsIgnoreCase(type)))
                .filter(e -> status == null || 
                        (e.getStatus() != null && e.getStatus().toString().equalsIgnoreCase(status)))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Event getEventById(@PathVariable String id) {
        return eventRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Event createEvent(@RequestBody Event event) {
        return eventRepository.save(event);
    }

    @PutMapping("/{id}")
    public Event updateEvent(@PathVariable String id, @RequestBody Event eventDetails) {
        Event event = eventRepository.findById(id).orElseThrow();
        event.setTitle(eventDetails.getTitle());
        event.setEventType(eventDetails.getEventType());
        event.setEventDate(eventDetails.getEventDate());
        event.setBasePrice(eventDetails.getBasePrice());
        event.setStatus(eventDetails.getStatus());
        event.setVenue(eventDetails.getVenue());
        return eventRepository.save(event);
    }

    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable String id) {
        eventRepository.deleteById(id);
    }
}
