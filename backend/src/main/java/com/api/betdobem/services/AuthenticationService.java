package com.api.betdobem.services;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateUserRequest;
import com.api.betdobem.dtos.requests.LoginRequest;
import com.api.betdobem.dtos.requests.RegisterRequest;
import com.api.betdobem.dtos.responses.TokenResponse;
import com.api.betdobem.infra.exceptions.DifferentPasswordsException;
import com.api.betdobem.infra.exceptions.EmailAlreadyExistsException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthenticationService {
    private final UserService userService;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;
    private final PasswordEncoder passwordEncoder;

    public AuthenticationService(UserService userService, AuthenticationManager authenticationManager, TokenService tokenService, PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.authenticationManager = authenticationManager;
        this.tokenService = tokenService;
        this.passwordEncoder = passwordEncoder;
    }

    public TokenResponse login(LoginRequest loginRequest) {
        var userPassword = new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password());
        try {
            var auth = authenticationManager.authenticate(userPassword);
            User userAuth = (User) auth.getPrincipal();
            String token = tokenService.generateToken(userAuth);
            return new TokenResponse(token);
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

}
