package com.risinglion.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "theaters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Theater {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "row_count")
    private int rows;

    @Column(name = "seats_per_row")
    private int seatsPerRow;

    @OneToMany(mappedBy = "theater")
    @Builder.Default
    private Set<Seat> seats = new HashSet<>();
}
