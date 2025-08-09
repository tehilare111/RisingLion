package com.risinglion.domain.repo;

import com.risinglion.domain.entity.Movie;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovieRepository extends JpaRepository<Movie, Long> {
    @Query("SELECT m FROM Movie m WHERE (:q IS NULL OR LOWER(m.title) LIKE LOWER(CONCAT('%', :q, '%'))) AND (:categoryId IS NULL OR m.category.id = :categoryId)")
    Page<Movie> search(@Param("q") String query, @Param("categoryId") Long categoryId, Pageable pageable);
}
