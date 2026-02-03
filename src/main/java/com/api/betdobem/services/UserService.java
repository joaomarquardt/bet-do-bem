package com.api.betdobem.services;

import com.api.betdobem.domain.User;
import com.api.betdobem.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<User> getAllUsers() {
        return null;
    }

    public User createUser(User user) {
        return null;
    }

    public User getUserById(Long id) {
        return null;
    }

    public User updateUser(Long id, User user) {
        return null;
    }

    public void deleteUser(Long id) {
    }
}
