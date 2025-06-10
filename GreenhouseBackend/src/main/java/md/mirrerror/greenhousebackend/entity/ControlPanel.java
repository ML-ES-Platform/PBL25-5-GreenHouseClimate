package md.mirrerror.greenhousebackend.entity;

import lombok.Data;
import org.springframework.stereotype.Component;

@Component
@Data
public class ControlPanel {

    private Boolean areWindowsOpened = false;
    private Boolean areFansOn = false;
    private Boolean areLightsOn = false;
    private Double temperatureSetpoint;

}
