package md.mirrerror.greenhousebackend.repositories;

import md.mirrerror.greenhousebackend.entity.SensorMeasurement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SensorMeasurementRepository extends JpaRepository<SensorMeasurement, Long> {
}