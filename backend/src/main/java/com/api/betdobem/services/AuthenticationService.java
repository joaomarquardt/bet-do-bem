package com.api.betdobem.services;

import com.api.betdobem.domain.RefreshToken;
import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateUserRequest;
import com.api.betdobem.dtos.requests.LoginRequest;
import com.api.betdobem.dtos.requests.RegisterRequest;
import com.api.betdobem.dtos.responses.LoginResult;
import com.api.betdobem.dtos.responses.TokenResponse;
import com.api.betdobem.infra.exceptions.DifferentPasswordsException;
import com.api.betdobem.infra.exceptions.EmailAlreadyExistsException;
import com.api.betdobem.infra.exceptions.RefreshTokenExpiredException;
import com.api.betdobem.repositories.RefreshTokenRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
public class AuthenticationService {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;

    public AuthenticationService(UserService userService, AuthenticationManager authenticationManager, TokenService tokenService, PasswordEncoder passwordEncoder, RefreshTokenRepository refreshTokenRepository) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
        this.refreshTokenRepository = refreshTokenRepository;
    }

    public LoginResult login(LoginRequest loginRequest) {
        var userPassword = new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password());
        try {
            var auth = authenticationManager.authenticate(userPassword);
            User userAuth = (User) auth.getPrincipal();
            String accessToken = tokenService.generateToken(userAuth);
            RefreshToken refreshToken = tokenService.generateRefreshToken(userAuth);
            return new LoginResult(accessToken, refreshToken.getToken());
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    public void register(RegisterRequest registerRequest) {
        if (!registerRequest.password().equals(registerRequest.passwordConfirmation())) {
            throw new DifferentPasswordsException("Passwords do not match");
        }
        if (userService.existsUserByEmail(registerRequest.email())) {
            throw new EmailAlreadyExistsException("Email already in use");
        }
        String encryptedPassword = passwordEncoder.encode(registerRequest.password());
        CreateUserRequest createUser = new CreateUserRequest(registerRequest.name(), registerRequest.email(), encryptedPassword);
        userService.createUser(createUser);
    }

    @Transactional
    public TokenResponse refreshToken(String refreshTokenString) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenString).orElseThrow(() -> new RuntimeException("Refresh token not found"));
        if (refreshToken.getExpirationInstant().compareTo(Instant.now()) < 0) {
            refreshTokenRepository.delete(refreshToken);
            throw new RefreshTokenExpiredException("Refresh token expired");
        }
        String newAccessToken = tokenService.generateToken(refreshToken.getUser());
        return new TokenResponse(newAccessToken);
    }

    @Transactional
    public void logout(String refreshTokenString, Long userId) {
        if (refreshTokenString != null && !refreshTokenString.isBlank()) {
            refreshTokenRepository.deleteByTokenAndUserId(refreshTokenString, userId);
        }
    }
}
