package com.example.catalog.repository;

import com.example.catalog.entity.Venue;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface VenueRepository extends MongoRepository<Venue, String> {
    List<Venue> findByCityIgnoreCase(String city);
}
