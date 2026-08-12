package com.api.betdobem.services;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateUserRequest;
import com.api.betdobem.dtos.requests.UpdatePictureRequest;
import com.api.betdobem.dtos.requests.UpdateUserRequest;
import com.api.betdobem.dtos.responses.*;
import com.api.betdobem.enums.UserRole;
import com.api.betdobem.mappers.UserMapper;
import com.api.betdobem.repositories.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
public class UserService {
    private UserRepository userRepository;
    private UserMapper userMapper;
    private WalletService walletService;
    private S3StorageService s3StorageService;
    private BetRepository betRepository;
    private ActivityRepository activityRepository;
    private VoteRepository voteRepository;
    private FriendshipRepository friendshipRepository;

    public UserService(UserRepository userRepository, UserMapper userMapper, WalletService walletService, S3StorageService s3StorageService, BetRepository betRepository, ActivityRepository activityRepository, VoteRepository voteRepository, FriendshipRepository friendshipRepository) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.walletService = walletService;
        this.s3StorageService = s3StorageService;
        this.betRepository = betRepository;
        this.activityRepository = activityRepository;
        this.voteRepository = voteRepository;
        this.friendshipRepository = friendshipRepository;
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

    public User getUserEntityByUsername(String username) {
        return userRepository.findByUsername(username).orElseThrow(() -> new EntityNotFoundException("User with username " + username + " not found."));
    }

    public boolean existsUserByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public boolean existsUserByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public PagedResponse<TransactionResponse> getUserTransactions(Long id, Pageable pageable) {
        return walletService.getUserTransactions(id, pageable);
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

    public UserProfileResponse getUserProfileById(Long id) {
        User user = getUserEntityById(id);
        long winningBets = betRepository.countWinningBetsByUserId(id);
        long registeredActivities = activityRepository.countByAuthorId(id);
        long computedVotes = voteRepository.countByVoterId(id);
        long friendsCount = friendshipRepository.countByUserIdOrFriendId(id, id);
        return userMapper.toUserProfileResponse(user, winningBets, registeredActivities, computedVotes, friendsCount);
    }

    public PagedResponse<FriendResponse> getUserFriends(Long id, Pageable pageable) {
        User user = getUserEntityById(id);
        Page<User> friends = friendshipRepository.findFriendsByUserId(user.getId(), pageable);
        List<FriendResponse> friendsList = userMapper.toFriendResponseList(friends.getContent());
        return new PagedResponse<>(
                friendsList,
                friends.getNumber(),
                friends.getSize(),
                friends.getTotalElements(),
                friends.getTotalPages(),
                friends.hasNext()
        );
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

    public PagedResponse<UserResponse> searchUsers(String query, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<User> usersPage = userRepository.searchUsers(query, pageable);
        return new PagedResponse<>(
                userMapper.toUserResponseList(usersPage.getContent()),
                usersPage.getNumber(),
                usersPage.getSize(),
                usersPage.getTotalElements(),
                usersPage.getTotalPages(),
                usersPage.hasNext()
        );
    }
}
