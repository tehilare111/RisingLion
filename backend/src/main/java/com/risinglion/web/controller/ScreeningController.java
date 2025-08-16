package com.risinglion.web.controller;

import com.risinglion.domain.entity.Movie;
import com.risinglion.domain.entity.Screening;
import com.risinglion.domain.entity.Theater;
import com.risinglion.domain.repo.ScreeningRepository;
import com.risinglion.domain.repo.TheaterRepository;
import com.risinglion.mapper.Mappers;
import com.risinglion.web.dto.CommonDtos.*;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ScreeningController {

    private final ScreeningRepository screeningRepository;
    private final TheaterRepository theaterRepository;
    private final Mappers mappers;

    public ScreeningController(ScreeningRepository screeningRepository, TheaterRepository theaterRepository, Mappers mappers) {
        this.screeningRepository = screeningRepository;
        this.theaterRepository = theaterRepository;
        this.mappers = mappers;
    }

    @GetMapping("/theaters")
    public List<TheaterDto> theaters() { return theaterRepository.findAll().stream().map(mappers::toTheaterDto).toList(); }

    @GetMapping("/screenings")
    public List<ScreeningDto> screenings(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        // Use start/end of day window to be portable across DBs and avoid DATE() in JPQL
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();
        return screeningRepository.findByDatetimeBetween(start, end).stream().map(mappers::toScreeningDto).toList();
    }

    @GetMapping("/screenings/{id}")
    public ResponseEntity<ScreeningDto> getScreening(@PathVariable Long id) {
        return screeningRepository.findById(id).map(mappers::toScreeningDto).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/movies/{id}/screenings")
    public List<ScreeningDto> screeningsForMovie(@PathVariable Long id, @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        LocalDate d = date != null ? date : LocalDate.now();
        LocalDateTime start = d.atStartOfDay();
        LocalDateTime end = d.plusDays(1).atStartOfDay();
        return screeningRepository.findByMovieIdAndDatetimeBetween(id, start, end).stream().map(mappers::toScreeningDto).toList();
    }

    @PostMapping("/admin/theaters")
    @PreAuthorize("hasRole('ADMIN')")
    public TheaterDto createTheater(@RequestBody TheaterCreateRequest req) {
        Theater t = theaterRepository.save(Theater.builder().build());
        return mappers.toTheaterDto(t);
    }

    @DeleteMapping("/admin/theaters/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTheater(@PathVariable Long id) { theaterRepository.deleteById(id); return ResponseEntity.noContent().build(); }

    @PostMapping("/admin/screenings")
    @PreAuthorize("hasRole('ADMIN')")
    public ScreeningDto createScreening(@Valid @RequestBody ScreeningCreateRequest req) {
        Screening s = new Screening();
        Movie m = new Movie(); m.setId(req.movieId());
        Theater t = new Theater(); t.setId(req.theaterId());
        s.setMovie(m); s.setTheater(t); s.setDatetime(parseLocalDateTime(req.datetime())); s.setTicketPrice(req.ticketPrice());
        return mappers.toScreeningDto(screeningRepository.save(s));
    }

    @PutMapping("/admin/screenings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ScreeningDto updateScreening(@PathVariable Long id, @Valid @RequestBody ScreeningUpdateRequest req) {
        Screening s = screeningRepository.findById(id).orElseThrow();
        Movie m = new Movie(); m.setId(req.movieId());
        Theater t = new Theater(); t.setId(req.theaterId());
        s.setMovie(m); s.setTheater(t); s.setDatetime(parseLocalDateTime(req.datetime())); s.setTicketPrice(req.ticketPrice());
        return mappers.toScreeningDto(screeningRepository.save(s));
    }

    private static LocalDateTime parseLocalDateTime(String input) {
        if (input == null || input.isBlank()) return null;
        // If input includes 'Z' or offset, treat it as instant and convert to server local
        if (input.endsWith("Z") || input.matches(".*[+-]\\d{2}:?\\d{2}$")) {
            return Instant.parse(input).atZone(ZoneId.systemDefault()).toLocalDateTime();
        }
        // Ensure seconds are present
        if (input.length() == 16) { // yyyy-MM-ddTHH:mm
            input = input + ":00";
        }
        return LocalDateTime.parse(input);
    }

    @DeleteMapping("/admin/screenings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteScreening(@PathVariable Long id) { screeningRepository.deleteById(id); return ResponseEntity.noContent().build(); }
}
