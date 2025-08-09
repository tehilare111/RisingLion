package com.risinglion.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tickets", uniqueConstraints = @UniqueConstraint(columnNames = {"screening_id", "seat_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ticket {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Seat seat;

    @ManyToOne(optional = false)
    private Booking booking;

    @ManyToOne(optional = false)
    private Screening screening;
}
