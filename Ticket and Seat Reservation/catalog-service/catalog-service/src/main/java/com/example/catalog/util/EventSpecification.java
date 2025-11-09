package com.example.catalog.util;

import com.example.catalog.entity.Event;
import com.example.catalog.entity.Status;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;

public class EventSpecification {

    public static Specification<Event> hasStatus(Status status) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("status"), status);
    }

    public static Specification<Event> eventAfter(LocalDateTime dateTime) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.greaterThanOrEqualTo(root.get("eventDate"), dateTime);
    }

    public static Specification<Event> eventBefore(LocalDateTime dateTime) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.lessThanOrEqualTo(root.get("eventDate"), dateTime);
    }
}
