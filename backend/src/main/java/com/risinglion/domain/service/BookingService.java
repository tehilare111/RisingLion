package com.risinglion.domain.service;

import com.risinglion.domain.entity.*;
import com.risinglion.domain.repo.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BookingService {
    private final ScreeningRepository screeningRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;

    public BookingService(ScreeningRepository screeningRepository, SeatRepository seatRepository, BookingRepository bookingRepository, TicketRepository ticketRepository) {
        this.screeningRepository = screeningRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
    }

    @Transactional
    public Booking book(Long userId, Long screeningId, List<Long> seatIds, UserRepository userRepository) {
        Screening screening = screeningRepository.findById(screeningId).orElseThrow(() -> new EntityNotFoundException("Screening not found"));
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));

        // Re-check availability to fail fast
        for (Long seatId : seatIds) {
            if (ticketRepository.existsByScreeningIdAndSeatId(screeningId, seatId)) {
                throw new DataIntegrityViolationException("Seat already taken");
            }
        }
        BigDecimal total = screening.getTicketPrice().multiply(BigDecimal.valueOf(seatIds.size()));
        Booking booking = Booking.builder().user(user).screening(screening).totalPrice(total).build();
        booking = bookingRepository.save(booking);
        for (Long seatId : seatIds) {
            Seat seat = seatRepository.findById(seatId).orElseThrow(() -> new EntityNotFoundException("Seat not found"));
            // Persist ticket; unique constraint on (screening_id, seat_id) will prevent double booking
            Ticket t = Ticket.builder().booking(booking).screening(screening).seat(seat).build();
            ticketRepository.save(t);
        }
        return booking;
    }
}
