package com.risinglion.domain.repo;

import com.risinglion.domain.entity.Screening;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface ScreeningRepository extends JpaRepository<Screening, Long> {
    @Query("select s from Screening s where DATE(s.datetime)=?1")
    List<Screening> findByDate(LocalDate date);

    List<Screening> findByMovieIdAndDatetimeBetween(Long movieId, LocalDateTime start, LocalDateTime end);

    List<Screening> findByDatetimeBetween(LocalDateTime start, LocalDateTime end);

    List<Screening> findByTheaterIdAndDatetimeBetween(Long theaterId, LocalDateTime start, LocalDateTime end);
}
