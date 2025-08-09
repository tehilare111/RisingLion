package com.risinglion.domain.repo;

import com.risinglion.domain.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByScreeningId(Long screeningId);
    // Checks if a user has any booking for a given movie with a screening time before the specified instant (i.e., already seen)
    boolean existsByUserIdAndScreening_Movie_IdAndScreening_DatetimeBefore(Long userId, Long movieId, LocalDateTime before);
}
