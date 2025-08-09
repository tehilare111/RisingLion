package com.risinglion.domain.repo;

import com.risinglion.domain.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByTheaterIdOrderByRowAscNumberAsc(Long theaterId);
}
