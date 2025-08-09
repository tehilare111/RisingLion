package com.risinglion.web.controller;

import com.risinglion.domain.entity.Category;
import com.risinglion.domain.entity.Movie;
import com.risinglion.domain.repo.CategoryRepository;
import com.risinglion.domain.repo.MovieRepository;
import com.risinglion.mapper.Mappers;
import com.risinglion.web.dto.CommonDtos.*;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MovieController {

    private final MovieRepository movieRepository;
    private final CategoryRepository categoryRepository;
    private final Mappers mappers;

    public MovieController(MovieRepository movieRepository, CategoryRepository categoryRepository, Mappers mappers) {
        this.movieRepository = movieRepository;
        this.categoryRepository = categoryRepository;
        this.mappers = mappers;
    }

    @GetMapping("/movies")
    public Page<MovieDto> movies(@RequestParam(name = "query", required = false) String query,
                                 @RequestParam(name = "categoryId", required = false) Long categoryId,
                                 @RequestParam(name = "page", defaultValue = "0") int page) {
        return movieRepository.search(query, categoryId, PageRequest.of(page, 12)).map(mappers::toMovieDto);
    }

    @GetMapping("/movies/{id}")
    public ResponseEntity<MovieDto> movie(@PathVariable("id") Long id) {
        return movieRepository.findById(id).map(mappers::toMovieDto).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/categories")
    public List<CategoryDto> categories() { return mappers.toCategoryDtos(categoryRepository.findAll()); }

    @PostMapping("/admin/categories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDto> createCategory(@Valid @RequestBody CategoryCreateRequest req) {
        Category c = Category.builder().name(req.name()).build();
        c = categoryRepository.save(c);
        return ResponseEntity.ok(mappers.toCategoryDto(c));
    }

    @PutMapping("/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoryDto> updateCategory(@PathVariable("id") Long id, @Valid @RequestBody CategoryUpdateRequest req) {
        Category c = categoryRepository.findById(id).orElseThrow();
        c.setName(req.name());
        return ResponseEntity.ok(mappers.toCategoryDto(categoryRepository.save(c)));
    }

    @DeleteMapping("/admin/categories/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) { categoryRepository.deleteById(id); return ResponseEntity.noContent().build(); }

    @PostMapping("/admin/movies")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieDto> createMovie(@Valid @RequestBody MovieCreateRequest req) {
        Category cat = categoryRepository.findById(req.categoryId()).orElseThrow();
        Movie m = Movie.builder().title(req.title()).duration(req.duration()).description(req.description()).releaseDate(req.releaseDate()).imageURL(req.imageURL()).category(cat).build();
        return ResponseEntity.ok(mappers.toMovieDto(movieRepository.save(m)));
    }

    @PutMapping("/admin/movies/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieDto> updateMovie(@PathVariable("id") Long id, @Valid @RequestBody MovieUpdateRequest req) {
        Movie m = movieRepository.findById(id).orElseThrow();
        Category cat = categoryRepository.findById(req.categoryId()).orElseThrow();
        m.setTitle(req.title()); m.setDuration(req.duration()); m.setDescription(req.description()); m.setReleaseDate(req.releaseDate()); m.setImageURL(req.imageURL()); m.setCategory(cat);
        return ResponseEntity.ok(mappers.toMovieDto(movieRepository.save(m)));
    }

    @DeleteMapping("/admin/movies/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMovie(@PathVariable("id") Long id) { movieRepository.deleteById(id); return ResponseEntity.noContent().build(); }
}
