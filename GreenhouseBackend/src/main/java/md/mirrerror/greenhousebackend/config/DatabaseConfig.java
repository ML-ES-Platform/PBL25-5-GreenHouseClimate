package md.mirrerror.greenhousebackend.config;

import org.apache.tomcat.jdbc.pool.DataSource;
import org.apache.tomcat.jdbc.pool.PoolProperties;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

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
