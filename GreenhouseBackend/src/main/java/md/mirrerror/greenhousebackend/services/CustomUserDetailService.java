package md.mirrerror.greenhousebackend.services;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.entity.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailService implements UserDetailsService {

    private final UserService userService;
    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailService.class);

    @Override
    @Transactional(readOnly = true)
    public User loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<User> user = userService.findByEmail(email);
        if (user.isEmpty()) {
            logger.error("User not found with email: " + email);
            throw new UsernameNotFoundException("User not found with email: " + email);
        }

        return user.get();
    }
}
