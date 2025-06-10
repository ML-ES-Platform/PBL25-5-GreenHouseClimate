package md.mirrerror.greenhousebackend.dtos;

import lombok.Data;

@Data
public class SensorMeasurementCreationDto {

    private Double temperature;
    private Double humidity;
    private Double light;

}
