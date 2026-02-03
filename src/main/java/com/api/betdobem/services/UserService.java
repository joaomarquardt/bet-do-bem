package com.api.betdobem.services;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateUserRequest;
import com.api.betdobem.dtos.requests.UpdateUserRequest;
import com.api.betdobem.dtos.responses.UserResponse;
import com.api.betdobem.mappers.UserMapper;
import com.api.betdobem.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private UserRepository userRepository;
    private UserMapper userMapper;

    public UserService(UserRepository userRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
    }

    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return userMapper.toUserResponseList(users);
    }

    public User getUserEntityById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("User with ID " + id + " not found."));
    }

    public UserResponse createUser(CreateUserRequest user) {
        return null;
    }

    public UserResponse getUserById(Long id) {
        return null;
    }

    public UserResponse updateUser(Long id, UpdateUserRequest user) {
        return null;
    }

    public void deleteUser(Long id) {
    }
}
