package com.api.betdobem.services;

import com.api.betdobem.domain.RefreshToken;
import com.api.betdobem.domain.User;
import com.api.betdobem.repositories.RefreshTokenRepository;
import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTCreationException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class TokenService {
    @Value("${app.jwt.secret}")
    private String secret;
    private final RefreshTokenRepository refreshTokenRepository;

    public TokenService(RefreshTokenRepository refreshTokenRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public String generateToken(User user) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            String role = user.getRole().name();
            return JWT.create()
                    .withIssuer("betdobem-api")
                    .withSubject(user.getUsername())
                    .withClaim("idUser", user.getId())
                    .withClaim("name", user.getName().split(" ")[0])
                    .withExpiresAt(Instant.now().plusSeconds(3600))
                    .withClaim("role", role)
                    .sign(algorithm);
        } catch (JWTCreationException e) {
            throw new JWTCreationException("Error while generating token", e);
        }
    }

    public String validateToken(String token) {
        try {
            Algorithm algorithm = Algorithm.HMAC256(secret);
            return JWT.require(algorithm)
                    .withIssuer("betdobem-api")
                    .build()
                    .verify(token)
                    .getSubject();
        } catch (JWTVerificationException e) {
            return "";
        }
    }

    public RefreshToken generateRefreshToken(User user) {
        String refreshTokenString = UUID.randomUUID().toString();
        Instant expirationInstant = Instant.now().plusSeconds(604800); // Refresh token expires in 7 days
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenString);
        refreshToken.setExpirationInstant(expirationInstant);
        refreshToken.setUser(user);
        return refreshTokenRepository.save(refreshToken);
    }
}
