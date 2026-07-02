package com.api.betdobem.config;

import com.api.betdobem.domain.User;
import com.api.betdobem.enums.UserRole;
import com.api.betdobem.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    @Value("${app.admin.password}")
    private String adminPassword;

    @Bean
    public CommandLineRunner initAdminUser(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByEmail("admin@admin.com") && !userRepository.existsByUsername("admin")) {
                User admin = new User();
                admin.setFullName("Administrador");
                admin.setUsername("admin");
                admin.setEmail("admin@admin.com");
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRole(UserRole.ADMIN);
                userRepository.save(admin);
                System.out.println("User ADMIN created successfully!");
            }
        };
    }
}
