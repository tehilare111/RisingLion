package com.risinglion.domain.repo;

import com.risinglion.domain.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByMovieId(Long movieId);
    Optional<Review> findByMovieIdAndUserId(Long movieId, Long userId);
}
