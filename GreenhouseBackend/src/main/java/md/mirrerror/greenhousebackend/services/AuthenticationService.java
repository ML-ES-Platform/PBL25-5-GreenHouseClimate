package md.mirrerror.greenhousebackend.services;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.dtos.LoginUserDto;
import md.mirrerror.greenhousebackend.dtos.RegisterUserDto;
import md.mirrerror.greenhousebackend.entity.User;
import md.mirrerror.greenhousebackend.entity.UserRoles;
import md.mirrerror.greenhousebackend.exceptions.UserAlreadyExistsException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

    public User signup(RegisterUserDto input) {

        if (userService.findByEmail(input.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException("Email is already in use");
        }

        User user = new User();

        user.setEmail(input.getEmail());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        user.setCreatedAt(new java.util.Date());
        user.setUpdatedAt(new java.util.Date());
        user.setUserRole(UserRoles.USER);

        logger.info("Creating new user: {}", user.getEmail());

        return userService.save(user);
    }

    public User authenticate(LoginUserDto input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(),
                        input.getPassword()
                )
        );

        logger.info("User authenticated: {}", input.getEmail());
        Optional<User> user = userService.findByEmail(input.getEmail());

        if (user.isEmpty()) {
            logger.error("User with email {} not found", input.getEmail());
            throw new UsernameNotFoundException("User with email " + input.getEmail() + " not found");
        }
        return user.get();
    }
}

