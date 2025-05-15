package md.mirrerror.greenhousebackend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_measurements")
@Getter
@Setter
public class SensorMeasurement {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Integer id;

    @Column(nullable = false)
    private Double temperature;

    @Column(nullable = false)
    private Double humidity;

    @Column
    private Double light;

    @Column
    private LocalDateTime timestamp;

}
