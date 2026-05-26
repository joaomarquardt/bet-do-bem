package com.api.betdobem.services;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateUserRequest;
import com.api.betdobem.dtos.requests.UpdatePictureRequest;
import com.api.betdobem.dtos.requests.UpdateUserRequest;
import com.api.betdobem.dtos.responses.TransactionResponse;
import com.api.betdobem.dtos.responses.UploadPictureResponse;
import com.api.betdobem.dtos.responses.UserResponse;
import com.api.betdobem.enums.UserRole;
import com.api.betdobem.mappers.UserMapper;
import com.api.betdobem.repositories.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class UserService {
    private UserRepository userRepository;
    private UserMapper userMapper;
    private WalletService walletService;
    private S3StorageService s3StorageService;

    public UserService(UserRepository userRepository, UserMapper userMapper, WalletService walletService, S3StorageService s3StorageService) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.walletService = walletService;
        this.s3StorageService = s3StorageService;
    }

    public List<UserResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return userMapper.toUserResponseList(users);
    }

    public User getUserEntityById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("User with ID " + id + " not found."));
    }

    public List<User> getUserEntitiesByIds(Set<Long> ids) {
        return userRepository.findAllById(ids);
    }

    public User getUserEntityByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new EntityNotFoundException("User with email " + email + " not found."));
    }

    public boolean existsUserByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public List<TransactionResponse> getUserTransactions(Long id) {
        return walletService.getUserTransactions(id);
    }

    public UserResponse createUser(CreateUserRequest user) {
        User userEntity = userMapper.toUserEntity(user);
        userEntity.setRole(UserRole.USER);
        User savedUser = userRepository.save(userEntity);
        return userMapper.toUserResponse(savedUser);
    }

    public UserResponse getUserById(Long id) {
        User user = getUserEntityById(id);
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateUser(Long id, UpdateUserRequest user) {
        User existingUser = getUserEntityById(id);
        userMapper.updateUserRequest(user, existingUser);
        User updatedUser = userRepository.save(existingUser);
        return userMapper.toUserResponse(updatedUser);
    }

    public UploadPictureResponse setProfilePicture(UpdatePictureRequest picture, Long id) {
        User user = getUserEntityById(id);
        String uniqueObjectKey = String.format("users/profiles/user_%d_%d_%s",
                id,
                System.currentTimeMillis(),
                picture.fileName().replaceAll("[^a-zA-Z0-9.-]", "_"));
        user.setProfilePictureUrl(uniqueObjectKey);
        userRepository.save(user);
        String uploadUrl = s3StorageService.generatePresignedUploadUrl(uniqueObjectKey, picture.contentType());
        return new UploadPictureResponse(uploadUrl);
    }

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
