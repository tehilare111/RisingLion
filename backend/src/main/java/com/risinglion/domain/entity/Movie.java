package com.risinglion.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "movies", uniqueConstraints = @UniqueConstraint(columnNames = {"title", "release_date"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Movie {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;

    @Positive
    private int duration; // minutes

    @Column(length = 2000)
    @NotBlank
    private String description;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "imageurl")
    private String imageURL;

    @ManyToOne(optional = false)
    private Category category;

    @OneToMany(mappedBy = "movie")
    @Builder.Default
    private Set<Screening> screenings = new HashSet<>();

    @OneToMany(mappedBy = "movie")
    @Builder.Default
    private Set<Review> reviews = new HashSet<>();
}
