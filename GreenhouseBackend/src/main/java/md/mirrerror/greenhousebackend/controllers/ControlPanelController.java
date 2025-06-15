package md.mirrerror.greenhousebackend.controllers;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import md.mirrerror.greenhousebackend.dtos.ChangeSetpointCommand;
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
    @PostMapping("/update-state")
    public ResponseEntity<Void> updateControlPanelState(@RequestBody ControlPanel newState) {
        controlPanel.setAreWindowsOpened(newState.getAreWindowsOpened());
        controlPanel.setAreFansOn(newState.getAreFansOn());
        controlPanel.setAreLightsOn(newState.getAreLightsOn());
        controlPanel.setTemperatureSetpoint(newState.getTemperatureSetpoint());
        controlPanel.setHumiditySetpoint(newState.getHumiditySetpoint());
        controlPanel.setLightSetpoint(newState.getLightSetpoint());

        log.info("Control panel state updated: {}", newState);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/toggle-windows")
    public ResponseEntity<Void> toggleWindows() {
        boolean newState = !controlPanel.getAreWindowsOpened();
        controlPanel.setAreWindowsOpened(newState);

        awsIotService.sendToggleWindowsCommand(newState);

        log.info("Windows toggled to: {}", newState);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/toggle-fans")
    public ResponseEntity<Void> toggleFans() {
        boolean newState = !controlPanel.getAreFansOn();
        controlPanel.setAreFansOn(newState);

        awsIotService.sendToggleFansCommand(newState);

        log.info("Fans toggled to: {}", newState);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/toggle-lights")
    public ResponseEntity<Void> toggleLights() {
        boolean newState = !controlPanel.getAreLightsOn();
        controlPanel.setAreLightsOn(newState);

        awsIotService.sendToggleLightsCommand(newState);

        log.info("Lights toggled to: {}", newState);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/set-temperature-setpoint")
    public ResponseEntity<Void> setTemperatureSetpoint(@RequestBody ChangeSetpointCommand temperatureSetpointCommand) {
        controlPanel.setTemperatureSetpoint(temperatureSetpointCommand.getSetpoint());

        awsIotService.sendSetTemperatureSetpointCommand(temperatureSetpointCommand);

        log.info("Temperature setpoint changed to: {}", temperatureSetpointCommand);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/set-humidity-setpoint")
    public ResponseEntity<Void> setHumiditySetpoint(@RequestBody ChangeSetpointCommand humiditySetpointCommand) {
        controlPanel.setHumiditySetpoint(humiditySetpointCommand.getSetpoint());

        awsIotService.sendSetHumiditySetpointCommand(humiditySetpointCommand);

        log.info("Humidity setpoint changed to: {}", humiditySetpointCommand);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/set-light-setpoint")
    public ResponseEntity<Void> setLightSetpoint(@RequestBody ChangeSetpointCommand lightSetpointCommand) {
        controlPanel.setLightSetpoint(lightSetpointCommand.getSetpoint());

        awsIotService.sendSetLightSetpointCommand(lightSetpointCommand);

        log.info("Light setpoint changed to: {}", lightSetpointCommand);
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/set-auto-mode")
    public ResponseEntity<Void> setAutoMode() {
        awsIotService.sendSetAutoModeCommand();

        log.info("Set auto mode command sent");
        return ResponseEntity.ok().build();
    }

}
