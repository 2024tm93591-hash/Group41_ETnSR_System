package com.example.catalog.repository;

import com.example.catalog.entity.Event;
import com.example.catalog.entity.Status;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import java.util.List;

public interface EventRepository extends MongoRepository<Event, String> {

    // Find events by status
    List<Event> findByStatus(Status status);

}

