package md.mirrerror.greenhousebackend.dtos;

import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class SensorMeasurementDto {

    private Double temperature;
    private Double humidity;
    private Double light;
    private ZonedDateTime timestamp;

}
