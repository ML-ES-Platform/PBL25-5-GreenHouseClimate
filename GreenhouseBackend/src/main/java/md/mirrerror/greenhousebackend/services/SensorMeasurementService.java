package md.mirrerror.greenhousebackend.services;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.entity.SensorMeasurement;
import md.mirrerror.greenhousebackend.repositories.SensorMeasurementRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SensorMeasurementService {

    private final SensorMeasurementRepository sensorMeasurementRepository;
    private static final Logger logger = LoggerFactory.getLogger(SensorMeasurementService.class);

    public List<SensorMeasurement> getAllSensorMeasurements() {
        return new ArrayList<>(sensorMeasurementRepository.findAll());
    }

}
