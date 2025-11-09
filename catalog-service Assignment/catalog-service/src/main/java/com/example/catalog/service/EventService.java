package com.example.catalog.service;

import com.example.catalog.entity.Event;
import com.example.catalog.entity.Status;
import com.example.catalog.repository.EventRepository;
import com.example.catalog.util.EventSpecification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EventService {

    private final EventRepository repo;

    public EventService(EventRepository repo) {
        this.repo = repo;
    }

    // Get all events
    public List<Event> getAllEvents() {
        return repo.findAll();
    }

    // Get events by status
    public List<Event> getEventsByStatus(Status status) {
        return repo.findAll(EventSpecification.hasStatus(status));
    }

    // Get events with Specification and pagination
    public List<Event> getFilteredEvents(Specification<Event> spec, Pageable pageable) {
        return repo.findAll(spec, pageable).getContent();
    }

    // Get an event by ID
    public Event getEventById(Long id) {
        return repo.findById(id).orElse(null);
    }
}
