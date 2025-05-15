package md.mirrerror.greenhousebackend.dtos.mappers;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.dtos.SensorMeasurementDto;
import md.mirrerror.greenhousebackend.entity.SensorMeasurement;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class SensorMeasurementMapper {

    public SensorMeasurementDto toDto(SensorMeasurement sensorMeasurement) {
        SensorMeasurementDto sensorMeasurementDto = new SensorMeasurementDto();
        sensorMeasurementDto.setTemperature(sensorMeasurement.getTemperature());
        sensorMeasurementDto.setHumidity(sensorMeasurement.getHumidity());
        sensorMeasurementDto.setLight(sensorMeasurement.getLight());
        sensorMeasurementDto.setTimestamp(sensorMeasurement.getTimestamp());
        return sensorMeasurementDto;
    }

    public List<SensorMeasurementDto> toDtoList(List<SensorMeasurement> sensorMeasurements) {
        return List.of(sensorMeasurements.stream().map(this::toDto).toArray(SensorMeasurementDto[]::new));
    }

    public SensorMeasurement toSensorMeasurement(SensorMeasurementDto sensorMeasurementDto) {
        SensorMeasurement sensorMeasurement = new SensorMeasurement();
        sensorMeasurement.setTemperature(sensorMeasurementDto.getTemperature());
        sensorMeasurement.setHumidity(sensorMeasurementDto.getHumidity());
        sensorMeasurement.setLight(sensorMeasurementDto.getLight());
        sensorMeasurement.setTimestamp(sensorMeasurementDto.getTimestamp());
        return sensorMeasurement;
    }

    public List<SensorMeasurement> toSensorMeasurementsList(List<SensorMeasurementDto> sensorMeasurementDtos) {
        return List.of(sensorMeasurementDtos.stream().map(this::toSensorMeasurement).toArray(SensorMeasurement[]::new));
    }

}
