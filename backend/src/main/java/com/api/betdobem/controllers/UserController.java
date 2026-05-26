package com.api.betdobem.controllers;

import com.api.betdobem.domain.User;
import com.api.betdobem.dtos.requests.CreateUserRequest;
import com.api.betdobem.dtos.requests.UpdatePictureRequest;
import com.api.betdobem.dtos.requests.UpdateUserRequest;
import com.api.betdobem.dtos.responses.TransactionResponse;
import com.api.betdobem.dtos.responses.UploadPictureResponse;
import com.api.betdobem.dtos.responses.UserResponse;
import com.api.betdobem.services.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userService.getAllUsers();
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(@RequestBody @Valid CreateUserRequest user) {
        UserResponse newUser = userService.createUser(user);
        return new ResponseEntity<>(newUser, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile(@AuthenticationPrincipal User loggedUser) {
        UserResponse user = userService.getUserById(loggedUser.getId());
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @PutMapping("me/profile-picture")
    public ResponseEntity<UploadPictureResponse> updateProfilePicture(@RequestBody @Valid UpdatePictureRequest picture, @AuthenticationPrincipal User loggedUser) {
        UploadPictureResponse uploadPictureResponse = userService.setProfilePicture(picture, loggedUser.getId());
        return new ResponseEntity<>(uploadPictureResponse, HttpStatus.OK);
    }

    @GetMapping("{id}/transactions")
    public ResponseEntity<List<TransactionResponse>> getUserTransactions(@PathVariable Long id) {
        List<TransactionResponse> transactions = userService.getUserTransactions(id);
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    @GetMapping("me/transactions")
    public ResponseEntity<List<TransactionResponse>> getMyTransactions(@AuthenticationPrincipal User loggedUser) {
        List<TransactionResponse> transactions = userService.getUserTransactions(loggedUser.getId());
        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id, @RequestBody @Valid UpdateUserRequest user) {
        UserResponse updatedUser = userService.updateUser(id, user);
        return new ResponseEntity<>(updatedUser, HttpStatus.OK);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }
}
