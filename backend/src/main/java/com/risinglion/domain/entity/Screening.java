package com.risinglion.domain.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "screenings", uniqueConstraints = @UniqueConstraint(columnNames = {"theater_id", "datetime"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Screening {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private LocalDateTime datetime;

    @Column(name = "ticket_price")
    private BigDecimal ticketPrice;

    @ManyToOne(optional = false)
    private Movie movie;

    @ManyToOne(optional = false)
    private Theater theater;

    @OneToMany(mappedBy = "screening")
    @Builder.Default
    private Set<Booking> bookings = new HashSet<>();

    @OneToMany(mappedBy = "screening")
    @Builder.Default
    private Set<Ticket> tickets = new HashSet<>();
}
