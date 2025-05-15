package md.mirrerror.greenhousebackend.controllers;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.controllers.response.LoginResponse;
import md.mirrerror.greenhousebackend.dtos.LoginUserDto;
import md.mirrerror.greenhousebackend.dtos.RegisterUserDto;
import md.mirrerror.greenhousebackend.dtos.UserDto;
import md.mirrerror.greenhousebackend.dtos.mappers.UserMapper;
import md.mirrerror.greenhousebackend.entity.User;
import md.mirrerror.greenhousebackend.services.AuthenticationService;
import md.mirrerror.greenhousebackend.services.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RequestMapping("/auth")
@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;
    private final UserMapper userMapper;
    private static final Logger logger = LoggerFactory.getLogger(AuthenticationController.class);

    @PostMapping("/signup")
    public ResponseEntity<UserDto> register(@Valid @RequestBody RegisterUserDto registerUserDto) {

        User registeredUser = authenticationService.signup(registerUserDto);
        logger.info("User registered: " + registeredUser.getEmail());

        return ResponseEntity.ok(userMapper.toDto(registeredUser));
    }

    @PostMapping("/login")
    public ResponseEntity<Object> authenticate(@Valid @RequestBody LoginUserDto loginUserDto) {

        User authenticatedUser = authenticationService.authenticate(loginUserDto);

        String jwtToken = jwtService.generateToken(authenticatedUser);

        LoginResponse loginResponse = new LoginResponse().setToken(jwtToken).setExpiresIn(jwtService.getExpirationTime());
        logger.info("User logged in: {}", authenticatedUser.getEmail());

        return ResponseEntity.ok(loginResponse);
    }

}
