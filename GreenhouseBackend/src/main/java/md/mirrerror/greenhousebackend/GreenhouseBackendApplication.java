package md.mirrerror.greenhousebackend;

import org.apache.tomcat.jdbc.pool.DataSource;
import org.apache.tomcat.jdbc.pool.PoolProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;

@SpringBootApplication
public class GreenhouseBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(GreenhouseBackendApplication.class, args);
    }

}
