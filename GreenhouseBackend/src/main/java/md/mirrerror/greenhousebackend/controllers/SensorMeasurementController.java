package md.mirrerror.greenhousebackend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.dtos.SensorMeasurementCreationDto;
import md.mirrerror.greenhousebackend.dtos.SensorMeasurementDto;
import md.mirrerror.greenhousebackend.dtos.mappers.SensorMeasurementMapper;
import md.mirrerror.greenhousebackend.services.SensorMeasurementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequestMapping("/sensor-measurements")
@RestController
@RequiredArgsConstructor
public class SensorMeasurementController {

    private final SensorMeasurementService sensorMeasurementService;
    private final SensorMeasurementMapper sensorMeasurementMapper;
    private static final Logger logger = LoggerFactory.getLogger(SensorMeasurementController.class);

    @PreAuthorize("hasRole('USER')")
    @GetMapping
    public ResponseEntity<List<SensorMeasurementDto>> all() {
        List<SensorMeasurementDto> measurements = sensorMeasurementMapper.toDtoList(sensorMeasurementService.getAllSensorMeasurements());
        return ResponseEntity.ok(measurements);
    }

    @PreAuthorize("hasRole('USER')")
    @PostMapping("/add")
    public ResponseEntity<Void> addMeasurement(@RequestBody @Valid SensorMeasurementCreationDto sensorMeasurementCreationDto) {
        sensorMeasurementService.saveSensorMeasurement(sensorMeasurementMapper.toSensorMeasurement(sensorMeasurementCreationDto));
        return ResponseEntity.ok().build();
    }

}
