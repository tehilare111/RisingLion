package com.risinglion.mapper;

import com.risinglion.domain.entity.*;
import com.risinglion.web.dto.CommonDtos.BookingDto;
import com.risinglion.web.dto.CommonDtos.CategoryDto;
import com.risinglion.web.dto.CommonDtos.MovieDto;
import com.risinglion.web.dto.CommonDtos.ReviewDto;
import com.risinglion.web.dto.CommonDtos.ScreeningDto;
import com.risinglion.web.dto.CommonDtos.SeatDto;
import com.risinglion.web.dto.CommonDtos.TheaterDto;
import com.risinglion.web.dto.CommonDtos.TicketDto;
import com.risinglion.web.dto.CommonDtos.UserAdminDto;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring", nullValueMappingStrategy = NullValueMappingStrategy.RETURN_DEFAULT)
public interface Mappers {
    CategoryDto toCategoryDto(Category c);
    List<CategoryDto> toCategoryDtos(List<Category> c);

    MovieDto toMovieDto(Movie m);

    TheaterDto toTheaterDto(Theater t);

    @Mapping(target = "taken", expression = "java(false)")
    SeatDto toSeatDto(Seat s);
    List<SeatDto> toSeatDtos(List<Seat> seats);

    @Mapping(target = "movieId", source = "movie.id")
    @Mapping(target = "theaterId", source = "theater.id")
    @Mapping(target = "datetime", source = "datetime", qualifiedByName = "localDateTimeToUtcZ")
    ScreeningDto toScreeningDto(Screening s);

    @Mapping(target = "seatId", source = "seat.id")
    TicketDto toTicketDto(Ticket t);

    @Mapping(target = "screeningId", source = "screening.id")
    BookingDto toBookingDto(Booking b);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "movieId", source = "movie.id")
    ReviewDto toReviewDto(Review r);

    @Mapping(target = "isAdmin", source = "admin")
    UserAdminDto toUserAdminDto(User u);

    @Named("localDateTimeToUtcZ")
    default String localDateTimeToUtcZ(java.time.LocalDateTime value) {
        if (value == null) return null;
        return value.atZone(java.time.ZoneId.systemDefault()).toInstant().toString();
    }
}
