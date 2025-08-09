package com.risinglion.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "seats", uniqueConstraints = @UniqueConstraint(columnNames = {"row_label", "number", "theater_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Seat {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "row_label")
    private String row; // A-Z

    private int number;

    @ManyToOne(optional = false)
    @JoinColumn(name = "theater_id")
    private Theater theater;
}
