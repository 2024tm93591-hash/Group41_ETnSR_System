package com.example.catalog.repository;

import com.example.catalog.entity.Event;
import com.example.catalog.entity.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    // Find events by status
    List<Event> findByStatus(Status status);

}

