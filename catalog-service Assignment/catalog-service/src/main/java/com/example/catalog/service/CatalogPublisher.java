package com.example.catalog.service;

import com.example.catalog.entity.Event;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class CatalogPublisher {
    private final ApplicationEventPublisher publisher;

    public CatalogPublisher(ApplicationEventPublisher publisher) {
        this.publisher = publisher;
    }

    public void publishEventCreated(Event event) {
        publisher.publishEvent(new EventCreatedEvent(this, event.getEventId()));
    }

    public static class EventCreatedEvent {
        private final Object source;
        private final Long eventId;
        public EventCreatedEvent(Object source, Long eventId) { this.source = source; this.eventId = eventId; }
        public Long getEventId() { return eventId; }
    }
}
