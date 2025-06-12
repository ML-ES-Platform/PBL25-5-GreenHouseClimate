package md.mirrerror.greenhousebackend.entity;

import lombok.Data;
import org.springframework.stereotype.Component;

@Component
@Data
public class ControlPanel {

    private Boolean areWindowsOpened;
    private Boolean areFansOn;
    private Boolean areLightsOn;
    private Double temperatureSetpoint;
    private Double humiditySetpoint;

}
