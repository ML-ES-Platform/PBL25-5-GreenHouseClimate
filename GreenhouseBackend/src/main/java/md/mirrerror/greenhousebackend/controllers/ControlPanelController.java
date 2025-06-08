package md.mirrerror.greenhousebackend.controllers;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.entity.ControlPanel;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class ControlPanelController {

    private final ControlPanel controlPanel;

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/control-panel/state")
    public ResponseEntity<ControlPanel> getControlPanelState() {
        return ResponseEntity.ok(controlPanel);
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/control-panel/toggle-windows")
    public ResponseEntity<Void> toggleWindows() {
        controlPanel.setAreWindowsOpened(!controlPanel.getAreWindowsOpened());
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/control-panel/toggle-fans")
    public ResponseEntity<Void> toggleFans() {
        controlPanel.setAreFansOn(!controlPanel.getAreFansOn());
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/control-panel/toggle-lights")
    public ResponseEntity<Void> toggleLights() {
        controlPanel.setAreLightsOn(!controlPanel.getAreLightsOn());
        return ResponseEntity.ok().build();
    }

}
