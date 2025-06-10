package md.mirrerror.greenhousebackend.controllers;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.entity.ControlPanel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/control-panel")
@RestController
@RequiredArgsConstructor
public class ControlPanelController {

    private final ControlPanel controlPanel;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/state")
    public ResponseEntity<ControlPanel> getControlPanelState() {
        return ResponseEntity.ok(controlPanel);
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/toggle-windows")
    public ResponseEntity<Void> toggleWindows() {
        controlPanel.setAreWindowsOpened(!controlPanel.getAreWindowsOpened());
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/toggle-fans")
    public ResponseEntity<Void> toggleFans() {
        controlPanel.setAreFansOn(!controlPanel.getAreFansOn());
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/toggle-lights")
    public ResponseEntity<Void> toggleLights() {
        controlPanel.setAreLightsOn(!controlPanel.getAreLightsOn());
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/set-temperature-setpoint")
    public ResponseEntity<Void> setTemperatureSetpoint(@RequestBody Double temperatureSetpoint) {
        controlPanel.setTemperatureSetpoint(temperatureSetpoint);
        return ResponseEntity.ok().build();
    }

}
