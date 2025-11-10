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
        private final String eventId;
        public EventCreatedEvent(Object source, String eventId) { this.source = source; this.eventId = eventId; }
        public String getEventId() { return eventId; }
    }
}
