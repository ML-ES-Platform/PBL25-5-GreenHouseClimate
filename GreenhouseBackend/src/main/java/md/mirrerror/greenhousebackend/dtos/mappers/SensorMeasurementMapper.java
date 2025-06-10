package md.mirrerror.greenhousebackend.dtos.mappers;

import lombok.RequiredArgsConstructor;
import md.mirrerror.greenhousebackend.dtos.SensorMeasurementCreationDto;
import md.mirrerror.greenhousebackend.dtos.SensorMeasurementDto;
import md.mirrerror.greenhousebackend.entity.SensorMeasurement;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
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

    public SensorMeasurementCreationDto toCreationDto(SensorMeasurement sensorMeasurement) {
        SensorMeasurementCreationDto sensorMeasurementCreationDto = new SensorMeasurementCreationDto();
        sensorMeasurementCreationDto.setTemperature(sensorMeasurement.getTemperature());
        sensorMeasurementCreationDto.setHumidity(sensorMeasurement.getHumidity());
        sensorMeasurementCreationDto.setLight(sensorMeasurement.getLight());
        return sensorMeasurementCreationDto;
    }

    public List<SensorMeasurementDto> toDtoList(List<SensorMeasurement> sensorMeasurements) {
        return List.of(sensorMeasurements.stream().map(this::toDto).toArray(SensorMeasurementDto[]::new));
    }

    public List<SensorMeasurementCreationDto> toCreationDtoList(List<SensorMeasurement> sensorMeasurements) {
        return List.of(sensorMeasurements.stream().map(this::toCreationDto).toArray(SensorMeasurementCreationDto[]::new));
    }

    public SensorMeasurement toSensorMeasurement(SensorMeasurementDto sensorMeasurementDto) {
        SensorMeasurement sensorMeasurement = new SensorMeasurement();
        sensorMeasurement.setTemperature(sensorMeasurementDto.getTemperature());
        sensorMeasurement.setHumidity(sensorMeasurementDto.getHumidity());
        sensorMeasurement.setLight(sensorMeasurementDto.getLight());
        sensorMeasurement.setTimestamp(sensorMeasurementDto.getTimestamp());
        return sensorMeasurement;
    }

    public SensorMeasurement toSensorMeasurement(SensorMeasurementCreationDto sensorMeasurementCreationDto) {
        SensorMeasurement sensorMeasurement = new SensorMeasurement();
        sensorMeasurement.setTemperature(sensorMeasurementCreationDto.getTemperature());
        sensorMeasurement.setHumidity(sensorMeasurementCreationDto.getHumidity());
        sensorMeasurement.setLight(sensorMeasurementCreationDto.getLight());
        sensorMeasurement.setTimestamp(LocalDateTime.now());
        return sensorMeasurement;
    }

    public List<SensorMeasurement> toSensorMeasurementsList(List<SensorMeasurementDto> sensorMeasurementDtos) {
        return List.of(sensorMeasurementDtos.stream().map(this::toSensorMeasurement).toArray(SensorMeasurement[]::new));
    }

}
