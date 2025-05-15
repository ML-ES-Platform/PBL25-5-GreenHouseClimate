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

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    public static void main(String[] args) {
        SpringApplication.run(GreenhouseBackendApplication.class, args);
    }

    @Bean
    public DataSource dataSource() {
        PoolProperties p = new PoolProperties();
        p.setUrl(datasourceUrl);
        // set mysql driver
        p.setDriverClassName("com.mysql.cj.jdbc.Driver");
        p.setUsername(datasourceUsername);
        p.setPassword(datasourcePassword);
        DataSource datasource = new DataSource();
        datasource.setPoolProperties(p);
        return datasource;
    }

    @Bean
    public JdbcTemplate jdbcTemplate(DataSource dataSource) {
        return new JdbcTemplate(dataSource);
    }

}
