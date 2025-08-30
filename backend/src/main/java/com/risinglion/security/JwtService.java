package com.risinglion.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${app.jwt.secret:}")
    private String configuredSecret;

    @Value("${app.jwt.expirationMinutes}")
    private long expirationMinutes;

    private volatile Key cachedSigningKey;

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    public String generateToken(UserDetails userDetails, Map<String, Object> extraClaims) {
        long expMillis = System.currentTimeMillis() + expirationMinutes * 60 * 1000;
        return Jwts.builder()
                .setClaims(extraClaims != null ? extraClaims : new HashMap<>())
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date())
                .setExpiration(new Date(expMillis))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        if (cachedSigningKey != null) {
            return cachedSigningKey;
        }

        String envSecret = System.getenv("APP_JWT_SECRET");
        String effectiveSecret = Optional.ofNullable(envSecret)
                .filter(s -> !s.isBlank())
                .or(() -> Optional.ofNullable(configuredSecret).filter(s -> !s.isBlank()))
                .orElseGet(this::generateRuntimeSecret);

        byte[] keyBytes;
        try {
            keyBytes = Base64.getUrlDecoder().decode(effectiveSecret);
        } catch (IllegalArgumentException e1) {
            try {
                keyBytes = Base64.getDecoder().decode(effectiveSecret);
            } catch (IllegalArgumentException e2) {
                keyBytes = effectiveSecret.getBytes(StandardCharsets.UTF_8);
            }
        }
        if (keyBytes.length < 32) {
            keyBytes = effectiveSecret.getBytes(StandardCharsets.UTF_8);
        }
        cachedSigningKey = Keys.hmacShaKeyFor(keyBytes);
        return cachedSigningKey;
    }

    private String generateRuntimeSecret() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
