package md.mirrerror.greenhousebackend.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class AWSIoTConfig {

    @Value("${aws.iot.endpoint}")
    private String endpoint;

    @Value("${aws.iot.client-id}")
    private String clientId;

    @Value("${aws.iot.certificate-path}")
    private String certificatePath;

    @Value("${aws.iot.private-key-path}")
    private String privateKeyPath;

    @Value("${aws.iot.ca-cert-path}")
    private String caCertPath;

    @Value("${aws.iot.thing-name}")
    private String thingName;

    @Value("${aws.iot.topic-prefix}")
    private String topicPrefix;

}