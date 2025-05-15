package md.mirrerror.greenhousebackend.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Date;

@Data
public class UserDto {

    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "User role is required")
    private String userRole;

    @NotNull(message = "Created at date is required")
    private Date createdAt;

    @NotNull(message = "Updated at date is required")
    private Date updatedAt;

//    @JsonIgnore
//    public String getUsername() {
//        return email;
//    }

}
