package com.api.betdobem.services;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.UserRequest;
import com.api.betdobem.dtos.responses.UserResponse;
import com.api.betdobem.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<UserResponse> getAllUsers() {
        return null;
    }

    public UserResponse createUser(UserRequest user) {
        return null;
    }

    public UserResponse getUserById(Long id) {
        return null;
    }

    public UserResponse updateUser(Long id, UserRequest user) {
        return null;
    }

    public void deleteUser(Long id) {
    }
}
