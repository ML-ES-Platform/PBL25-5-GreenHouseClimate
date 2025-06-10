package md.mirrerror.greenhousebackend.dtos;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DeviceCommand {

    private String commandType;
    private Object payload;
    private long timestamp;

}
