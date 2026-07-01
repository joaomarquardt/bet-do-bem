package com.api.betdobem.config;

import com.api.betdobem.domain.User;
import com.api.betdobem.services.AuthorizationService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Component;
import com.api.betdobem.services.TokenService;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.servlet.HandlerExceptionResolver;

import java.io.IOException;

@Component
public class SecurityFilter extends OncePerRequestFilter {
    private TokenService tokenService;
    private AuthorizationService authorizationService;
    private HandlerExceptionResolver exceptionResolver;

    public SecurityFilter(TokenService tokenService, AuthorizationService authorizationService, @Qualifier("handlerExceptionResolver") HandlerExceptionResolver exceptionResolver) {
        this.tokenService = tokenService;
        this.authorizationService = authorizationService;
        this.exceptionResolver = exceptionResolver;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        try {
            var token = this.recoverToken(request);
            if (token != null) {
                var username = tokenService.validateToken(token);
                if (username != null && !username.isEmpty()) {
                    User user = (User) authorizationService.loadUserByUsername(username);
                    if (user != null) {
                        var authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }
            filterChain.doFilter(request, response);
        } catch (Exception ex) {
            exceptionResolver.resolveException(request, response, null, ex);
        }
    }

    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null) return null;
        return authHeader.replace("Bearer ", "");
    }
}
