package md.mirrerror.greenhousebackend.dtos.mappers;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.dtos.UserDto;
import md.mirrerror.greenhousebackend.entity.User;
import md.mirrerror.greenhousebackend.entity.UserRoles;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class UserMapper {

    public UserDto toDto(User user) {
        UserDto userDto = new UserDto();
        userDto.setEmail(user.getEmail());
        userDto.setCreatedAt(user.getCreatedAt());
        userDto.setUpdatedAt(user.getUpdatedAt());
        userDto.setUserRole(user.getUserRole().toString());

        return userDto;
    }

    public List<UserDto> toDtoList(List<User> users) {
        return List.of(users.stream().map(this::toDto).toArray(UserDto[]::new));
    }

    public User toUser(UserDto userDto) {
        User user = new User();
        user.setEmail(userDto.getEmail());
        user.setCreatedAt(userDto.getCreatedAt());
        user.setUpdatedAt(userDto.getUpdatedAt());
        user.setUserRole(UserRoles.valueOf(userDto.getUserRole()));

        return user;
    }

    public List<User> toUserList(List<UserDto> userDtos) {
        return List.of(userDtos.stream().map(this::toUser).toArray(User[]::new));
    }

}
