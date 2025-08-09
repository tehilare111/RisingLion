package com.risinglion.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class CommonDtos {
    // Category
    public record CategoryDto(Long id, String name) {}
    public record CategoryCreateRequest(String name) {}
    public record CategoryUpdateRequest(String name) {}

    // Movie
    public record MovieDto(Long id, String title, int duration, String description, LocalDate releaseDate, String imageURL, CategoryDto category) {}
    public record MovieCreateRequest(String title, int duration, String description, LocalDate releaseDate, String imageURL, Long categoryId) {}
    public record MovieUpdateRequest(String title, int duration, String description, LocalDate releaseDate, String imageURL, Long categoryId) {}

    // Theater & Seat
    public record TheaterDto(Long id) {}
    public record TheaterCreateRequest() {}
    public record SeatDto(Long id, String row, int number, boolean taken) {}

    // Screening
    public record ScreeningDto(Long id, LocalDateTime datetime, BigDecimal ticketPrice, Long movieId, Long theaterId) {}
    public record ScreeningCreateRequest(Long movieId, Long theaterId, LocalDateTime datetime, BigDecimal ticketPrice) {}
    public record ScreeningUpdateRequest(Long movieId, Long theaterId, LocalDateTime datetime, BigDecimal ticketPrice) {}

    // Booking
    public record BookingDto(Long id, Long screeningId, BigDecimal totalPrice, List<TicketDto> tickets) {}
    public record TicketDto(Long id, Long seatId) {}
    public record BookingCreateRequest(Long screeningId, List<Long> seatIds) {}

    // Review
    public record ReviewDto(Long id, int rating, String text, Long userId, Long movieId) {}
    public record ReviewCreateRequest(int rating, String text) {}
    public record ReviewUpdateRequest(int rating, String text) {}

    // User
    public record MeResponse(Long id, String email, boolean isAdmin) {}
    public record MeUpdateRequest(String email) {}

    public record UserAdminDto(Long id, String username, String email, boolean isAdmin) {}
}
