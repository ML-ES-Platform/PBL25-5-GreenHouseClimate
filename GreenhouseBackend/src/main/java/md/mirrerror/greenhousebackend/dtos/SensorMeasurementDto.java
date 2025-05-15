package md.mirrerror.greenhousebackend.dtos;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SensorMeasurementDto {

    private Double temperature;
    private Double humidity;
    private Double light;
    private LocalDateTime timestamp;

}
