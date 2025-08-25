package com.risinglion.web.controller;

import com.risinglion.domain.entity.Movie;
import com.risinglion.domain.entity.Screening;
import com.risinglion.domain.entity.Theater;
import com.risinglion.domain.repo.ScreeningRepository;
import com.risinglion.domain.repo.MovieRepository;
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
import java.util.List;

@RestController
@RequestMapping("/api")
public class ScreeningController {

    private final ScreeningRepository screeningRepository;
    private final TheaterRepository theaterRepository;
    private final MovieRepository movieRepository;
    private final Mappers mappers;

    public ScreeningController(ScreeningRepository screeningRepository, TheaterRepository theaterRepository, MovieRepository movieRepository, Mappers mappers) {
        this.screeningRepository = screeningRepository;
        this.theaterRepository = theaterRepository;
        this.movieRepository = movieRepository;
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
        Movie m = movieRepository.findById(req.movieId()).orElseThrow();
        Theater t = new Theater(); t.setId(req.theaterId());

        var start = req.datetime().atZone(java.time.ZoneOffset.UTC).toLocalDateTime();
        var end = start.plusMinutes(m.getDuration());

        var windowStart = start.minusDays(1);
        var windowEnd = end.plusDays(1);
        var conflicts = screeningRepository.findByTheaterIdAndDatetimeBetween(req.theaterId(), windowStart, windowEnd)
                .stream()
                .anyMatch(existing -> {
                    var existingStart = existing.getDatetime();
                    var existingEnd = existingStart.plusMinutes(existing.getMovie().getDuration());
                    return start.isBefore(existingEnd) && end.isAfter(existingStart);
                });
        if (conflicts) {
            throw new IllegalArgumentException("Screening overlaps with an existing screening in this theater");
        }

        s.setMovie(m); s.setTheater(t); s.setDatetime(start); s.setTicketPrice(req.ticketPrice());
        return mappers.toScreeningDto(screeningRepository.save(s));
    }

    @PutMapping("/admin/screenings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ScreeningDto updateScreening(@PathVariable Long id, @Valid @RequestBody ScreeningUpdateRequest req) {
        Screening s = screeningRepository.findById(id).orElseThrow();
        Movie m = movieRepository.findById(req.movieId()).orElseThrow();
        Theater t = new Theater(); t.setId(req.theaterId());

        var start = req.datetime().atZone(java.time.ZoneOffset.UTC).toLocalDateTime();
        var end = start.plusMinutes(m.getDuration());

        var windowStart = start.minusDays(1);
        var windowEnd = end.plusDays(1);
        var conflicts = screeningRepository.findByTheaterIdAndDatetimeBetween(req.theaterId(), windowStart, windowEnd)
                .stream()
                .filter(existing -> !existing.getId().equals(id))
                .anyMatch(existing -> {
                    var existingStart = existing.getDatetime();
                    var existingEnd = existingStart.plusMinutes(existing.getMovie().getDuration());
                    return start.isBefore(existingEnd) && end.isAfter(existingStart);
                });
        if (conflicts) {
            throw new IllegalArgumentException("Screening overlaps with an existing screening in this theater");
        }

        s.setMovie(m); s.setTheater(t); s.setDatetime(start); s.setTicketPrice(req.ticketPrice());
        return mappers.toScreeningDto(screeningRepository.save(s));
    }

    @DeleteMapping("/admin/screenings/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteScreening(@PathVariable Long id) { screeningRepository.deleteById(id); return ResponseEntity.noContent().build(); }
}
