package com.risinglion.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

public final class DateTimeUtils {
    private DateTimeUtils() {}

    public static LocalDateTime parseUtcToLocal(String isoInstant) {
        return Instant.parse(isoInstant).atZone(ZoneId.systemDefault()).toLocalDateTime();
    }
}


