package md.mirrerror.greenhousebackend.controllers;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.dtos.UserDto;
import md.mirrerror.greenhousebackend.dtos.mappers.UserMapper;
import md.mirrerror.greenhousebackend.entity.User;
import md.mirrerror.greenhousebackend.exceptions.UserNotFoundException;
import md.mirrerror.greenhousebackend.services.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserMapper userMapper;
    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/account/me")
    public ResponseEntity<UserDto> authenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        User currentUser = (User) authentication.getPrincipal();

        return ResponseEntity.ok(userMapper.toDto(currentUser));
    }

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/account/user/{userId}")
    public ResponseEntity<UserDto> getUser(@PathVariable Long userId) {
        Optional<User> user = userService.findById(userId);

        if(user.isEmpty()) {
            logger.error("User " + userId + " not found");
            throw new UserNotFoundException("User not found");
        }

        return ResponseEntity.ok(userMapper.toDto(user.get()));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/account/all-users")
    public ResponseEntity<List<UserDto>> allUsers() {
        List<User> users = userService.allUsers();

        return ResponseEntity.ok(userMapper.toDtoList(users));
    }

}
