package md.mirrerror.greenhousebackend.controllers;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.dtos.SensorMeasurementDto;
import md.mirrerror.greenhousebackend.dtos.mappers.SensorMeasurementMapper;
import md.mirrerror.greenhousebackend.services.SensorMeasurementService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SensorMeasurementController {

    private final SensorMeasurementService sensorMeasurementService;
    private final SensorMeasurementMapper sensorMeasurementMapper;
    private static final Logger logger = LoggerFactory.getLogger(SensorMeasurementController.class);

    @PreAuthorize("hasRole('USER')")
    @GetMapping("/sensor-measurements")
    public ResponseEntity<List<SensorMeasurementDto>> all() {
        List<SensorMeasurementDto> measurements = sensorMeasurementMapper.toDtoList(sensorMeasurementService.getAllSensorMeasurements());
        return ResponseEntity.ok(measurements);
    }

}
