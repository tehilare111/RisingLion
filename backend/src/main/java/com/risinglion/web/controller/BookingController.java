package com.risinglion.web.controller;

import com.risinglion.domain.entity.Booking;
import com.risinglion.domain.entity.User;
import com.risinglion.domain.repo.*;
import com.risinglion.domain.service.BookingService;
import com.risinglion.mapper.Mappers;
import com.risinglion.web.dto.CommonDtos.*;
import jakarta.validation.Valid;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;
    private final BookingRepository bookingRepository;
    private final TicketRepository ticketRepository;
    private final ScreeningRepository screeningRepository;
    private final UserRepository userRepository;
    private final SeatRepository seatRepository;
    private final Mappers mappers;

    public BookingController(BookingService bookingService, BookingRepository bookingRepository, TicketRepository ticketRepository, ScreeningRepository screeningRepository, UserRepository userRepository, SeatRepository seatRepository, Mappers mappers) {
        this.bookingService = bookingService;
        this.bookingRepository = bookingRepository;
        this.ticketRepository = ticketRepository;
        this.screeningRepository = screeningRepository;
        this.userRepository = userRepository;
        this.seatRepository = seatRepository;
        this.mappers = mappers;
    }

    @GetMapping("/screenings/{id}/seats")
    public ResponseEntity<List<SeatDto>> seatMap(@PathVariable Long id) {
        var screening = screeningRepository.findById(id).orElse(null);
        if (screening == null) return ResponseEntity.notFound().build();
        var theaterId = screening.getTheater().getId();
        Set<Long> taken = ticketRepository.findByScreeningId(id).stream().map(t -> t.getSeat().getId()).collect(Collectors.toSet());
        List<SeatDto> seatDtos = seatRepository.findByTheaterIdOrderByRowAscNumberAsc(theaterId)
                .stream()
                .map(s -> new SeatDto(s.getId(), s.getRow(), s.getNumber(), taken.contains(s.getId())))
                .toList();
        return ResponseEntity.ok(seatDtos);
    }

    @PostMapping("/bookings")
    public ResponseEntity<BookingDto> createBooking(Authentication auth, @Valid @RequestBody BookingCreateRequest req) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        try {
            Booking b = bookingService.book(user.getId(), req.screeningId(), req.seatIds(), userRepository);
            return ResponseEntity.ok(mappers.toBookingDto(b));
        } catch (DataIntegrityViolationException ex) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    @GetMapping("/bookings/me")
    public List<BookingDto> myBookings(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        return bookingRepository.findByUserId(user.getId()).stream().map(mappers::toBookingDto).toList();
    }

    @GetMapping("/screenings/{id}/bookings")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public List<BookingDto> bookingsForScreening(@PathVariable Long id) {
        return bookingRepository.findByScreeningId(id).stream().map(mappers::toBookingDto).toList();
    }
}
