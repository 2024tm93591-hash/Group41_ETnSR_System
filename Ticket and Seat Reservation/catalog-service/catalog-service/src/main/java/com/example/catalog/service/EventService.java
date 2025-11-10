package com.example.catalog.service;

import com.example.catalog.entity.Event;
import com.example.catalog.entity.Status;
import com.example.catalog.repository.EventRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
        return repo.findByStatus(status);
    }

    // Get events with pagination
    public List<Event> getFilteredEvents(Pageable pageable) {
        Page<Event> page = repo.findAll(pageable);
        return page.getContent();
    }

    // Get an event by ID
    public Event getEventById(String id) {
        return repo.findById(id).orElse(null);
    }
}
