package com.risinglion.domain.repo;

import com.risinglion.domain.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByScreeningId(Long screeningId);
    boolean existsByScreeningIdAndSeatId(Long screeningId, Long seatId);
}
