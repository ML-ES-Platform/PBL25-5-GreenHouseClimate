package md.mirrerror.greenhousebackend.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.dtos.RatingReviewDto;
import md.mirrerror.greenhousebackend.dtos.mappers.RatingReviewMapper;
import md.mirrerror.greenhousebackend.entity.RatingReview;
import md.mirrerror.greenhousebackend.entity.User;
import md.mirrerror.greenhousebackend.repositories.RatingReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Transactional
public class RatingReviewService {

    private final RatingReviewRepository ratingReviewRepository;
    private final UserService userService;
    private final RatingReviewMapper ratingReviewMapper;
    private static final Logger logger = LoggerFactory.getLogger(RatingReviewService.class);

    public RatingReviewDto addReview(Long userId, RatingReviewDto reviewDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        User reviewedUser = userService.findById(userId).orElse(null);

        if (reviewedUser == null) {
            logger.error("User not found with id: {}", userId);
            throw new IllegalArgumentException("User not found");
        }

        RatingReview ratingReview = ratingReviewMapper.toRatingReview(currentUser.getId(), reviewedUser.getId(), reviewDto, currentUser, reviewedUser);
        ratingReviewRepository.save(ratingReview);

        logger.info("Review added by user: {} for user: {}", currentUser.getId(), reviewedUser.getId());

        return reviewDto;
    }

}