package md.mirrerror.greenhousebackend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import md.mirrerror.greenhousebackend.dtos.ChangeSetpointCommand;
import md.mirrerror.greenhousebackend.dtos.ToggleCommand;
import md.mirrerror.greenhousebackend.entity.ControlPanel;
import md.mirrerror.greenhousebackend.services.AWSIoTService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/control-panel")
@RestController
@RequiredArgsConstructor
@Slf4j
public class ControlPanelController {

    private final ControlPanel controlPanel;
    private final AWSIoTService awsIotService;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/state")
    public ResponseEntity<ControlPanel> getControlPanelState() {
        return ResponseEntity.ok(controlPanel);
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/toggle-windows")
    public ResponseEntity<Void> toggleWindows() {
        boolean newState = !controlPanel.getAreWindowsOpened();
        controlPanel.setAreWindowsOpened(newState);

        ToggleCommand command = ToggleCommand.builder().state(newState).build();
        awsIotService.sendCommand("TOGGLE_WINDOWS", command);

        log.info("Windows toggled to: {}", newState);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/toggle-fans")
    public ResponseEntity<Void> toggleFans() {
        boolean newState = !controlPanel.getAreFansOn();
        controlPanel.setAreFansOn(newState);

        ToggleCommand command = ToggleCommand.builder().state(newState).build();
        awsIotService.sendCommand("TOGGLE_FANS", command);

        log.info("Fans toggled to: {}", newState);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/toggle-lights")
    public ResponseEntity<Void> toggleLights() {
        boolean newState = !controlPanel.getAreLightsOn();
        controlPanel.setAreLightsOn(newState);

        ToggleCommand command = ToggleCommand.builder().state(newState).build();
        awsIotService.sendCommand("TOGGLE_LIGHTS", command);

        log.info("Lights toggled to: {}", newState);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/set-temperature-setpoint")
    public ResponseEntity<Void> setTemperatureSetpoint(@RequestBody ChangeSetpointCommand temperatureSetpointCommand) {
        controlPanel.setTemperatureSetpoint(temperatureSetpointCommand.getSetpoint());

        awsIotService.sendCommand("SET_TEMPERATURE", temperatureSetpointCommand);

        log.info("Temperature setpoint changed to: {}", temperatureSetpointCommand);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/set-humidity-setpoint")
    public ResponseEntity<Void> setHumiditySetpoint(@RequestBody ChangeSetpointCommand humiditySetpointCommand) {
        controlPanel.setHumiditySetpoint(humiditySetpointCommand.getSetpoint());

        awsIotService.sendCommand("SET_HUMIDITY", humiditySetpointCommand);

        log.info("Humidity setpoint changed to: {}", humiditySetpointCommand);
        return ResponseEntity.ok().build();
    }

}
