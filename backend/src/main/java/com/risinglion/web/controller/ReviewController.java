package com.risinglion.web.controller;

import com.risinglion.domain.entity.Movie;
import com.risinglion.domain.entity.Review;
import com.risinglion.domain.entity.User;
import com.risinglion.domain.repo.BookingRepository;
import com.risinglion.domain.repo.MovieRepository;
import com.risinglion.domain.repo.ReviewRepository;
import com.risinglion.domain.repo.UserRepository;
import com.risinglion.mapper.Mappers;
import com.risinglion.web.dto.CommonDtos.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class ReviewController {

    private final ReviewRepository reviewRepository;
    private final MovieRepository movieRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final Mappers mappers;

    public ReviewController(ReviewRepository reviewRepository, MovieRepository movieRepository, UserRepository userRepository, BookingRepository bookingRepository, Mappers mappers) {
        this.reviewRepository = reviewRepository;
        this.movieRepository = movieRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.mappers = mappers;
    }

    @GetMapping("/movies/{movieId}/reviews")
    public List<ReviewDto> getReviews(@PathVariable("movieId") Long movieId) {
        return reviewRepository.findByMovieId(movieId).stream().map(mappers::toReviewDto).toList();
    }

    @PostMapping("/movies/{movieId}/reviews")
    public ResponseEntity<ReviewDto> createReview(Authentication auth, @PathVariable("movieId") Long movieId, @Valid @RequestBody ReviewCreateRequest req) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        Movie movie = movieRepository.findById(movieId).orElseThrow();
        // allow only if the user has a booking for this movie in the past
        boolean seen = bookingRepository.existsByUserIdAndScreening_Movie_IdAndScreening_DatetimeBefore(user.getId(), movieId, LocalDateTime.now());
        if (!seen) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        // upsert-like: if review exists, update it; else create new
        Review review = reviewRepository.findByMovieIdAndUserId(movieId, user.getId()).orElse(
                Review.builder().user(user).movie(movie).build()
        );
        review.setRating(clampRating(req.rating()));
        review.setText(req.text());
        Review saved = reviewRepository.save(review);
        return ResponseEntity.ok(mappers.toReviewDto(saved));
    }

    @PutMapping("/movies/{movieId}/reviews")
    public ResponseEntity<ReviewDto> updateOwnReview(Authentication auth, @PathVariable("movieId") Long movieId, @Valid @RequestBody ReviewUpdateRequest req) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        Review review = reviewRepository.findByMovieIdAndUserId(movieId, user.getId()).orElse(null);
        if (review == null) return ResponseEntity.notFound().build();
        // user can update only after seeing the movie (same rule as create)
        boolean seen = bookingRepository.existsByUserIdAndScreening_Movie_IdAndScreening_DatetimeBefore(user.getId(), movieId, LocalDateTime.now());
        if (!seen) return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        review.setRating(clampRating(req.rating()));
        review.setText(req.text());
        return ResponseEntity.ok(mappers.toReviewDto(reviewRepository.save(review)));
    }

    @DeleteMapping("/movies/{movieId}/reviews")
    public ResponseEntity<Void> deleteOwnReview(Authentication auth, @PathVariable("movieId") Long movieId) {
        User user = userRepository.findByEmail(auth.getName()).orElseThrow();
        Review review = reviewRepository.findByMovieIdAndUserId(movieId, user.getId()).orElse(null);
        if (review == null) return ResponseEntity.notFound().build();
        reviewRepository.delete(review);
        return ResponseEntity.noContent().build();
    }

    private int clampRating(int rating) {
        if (rating < 1) return 1;
        if (rating > 5) return 5;
        return rating;
    }
}
