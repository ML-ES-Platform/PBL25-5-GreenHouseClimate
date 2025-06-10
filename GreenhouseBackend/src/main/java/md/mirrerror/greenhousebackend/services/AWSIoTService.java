package md.mirrerror.greenhousebackend.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import md.mirrerror.greenhousebackend.config.AWSIoTConfig;
import md.mirrerror.greenhousebackend.dtos.DeviceCommand;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.crt.CRT;
import software.amazon.awssdk.crt.CrtResource;
import software.amazon.awssdk.crt.io.ClientBootstrap;
import software.amazon.awssdk.crt.io.EventLoopGroup;
import software.amazon.awssdk.crt.io.HostResolver;
import software.amazon.awssdk.crt.mqtt.MqttClientConnection;
import software.amazon.awssdk.crt.mqtt.MqttClientConnectionEvents;
import software.amazon.awssdk.crt.mqtt.MqttMessage;
import software.amazon.awssdk.iot.AwsIotMqttConnectionBuilder;

import java.nio.charset.StandardCharsets;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AWSIoTService {

    private final AWSIoTConfig awsIotConfig;
    private final ObjectMapper objectMapper;

    private MqttClientConnection connection;
    private String commandTopic;

    @PostConstruct
    public void initialize() {
        try {
            commandTopic = String.format("%s/%s/commands",
                    awsIotConfig.getTopicPrefix(), awsIotConfig.getThingName());

            initializeMqttConnection();

            log.info("AWS IoT service initialized successfully");
        } catch (Exception e) {
            log.error("Failed to initialize AWS IoT service", e);
            throw new RuntimeException("AWS IoT initialization failed", e);
        }
    }

    private void initializeMqttConnection() throws InterruptedException, ExecutionException {
        try (EventLoopGroup eventLoopGroup = new EventLoopGroup(1);
             HostResolver resolver = new HostResolver(eventLoopGroup);
             ClientBootstrap clientBootstrap = new ClientBootstrap(eventLoopGroup, resolver)) {

            MqttClientConnectionEvents callbacks = new MqttClientConnectionEvents() {
                @Override
                public void onConnectionInterrupted(int errorCode) {
                    if (errorCode != 0) {
                        log.warn("Connection interrupted: {}", CRT.awsErrorString(errorCode));
                    }
                }

                @Override
                public void onConnectionResumed(boolean sessionPresent) {
                    log.info("Connection resumed: {}", sessionPresent ? "existing session" : "new session");
                }
            };

            AwsIotMqttConnectionBuilder builder = AwsIotMqttConnectionBuilder.newMtlsBuilderFromPath(
                            awsIotConfig.getCertificatePath(),
                            awsIotConfig.getPrivateKeyPath())
                    .withBootstrap(clientBootstrap)
                    .withConnectionEventCallbacks(callbacks)
                    .withClientId(awsIotConfig.getClientId())
                    .withEndpoint(awsIotConfig.getEndpoint())
                    .withCleanSession(true)
                    .withProtocolOperationTimeoutMs(60000);

            connection = builder.build();
            CompletableFuture<Boolean> connected = connection.connect();

            try {
                boolean sessionPresent = connected.get();
                log.info("Connected to AWS IoT Core: {}", sessionPresent ? "existing session" : "new session");
            } catch (Exception ex) {
                throw new RuntimeException("Exception occurred during connect", ex);
            }
        }
    }

    public void sendCommand(String commandType, Object payload) {
        try {
            DeviceCommand command = DeviceCommand.builder()
                    .commandType(commandType)
                    .payload(payload)
                    .timestamp(System.currentTimeMillis())
                    .build();

            String messageJson = objectMapper.writeValueAsString(command);
            MqttMessage message = new MqttMessage(commandTopic, messageJson.getBytes(StandardCharsets.UTF_8));

            CompletableFuture<Integer> publishResult = connection.publish(message);
            publishResult.get();

            log.info("Command sent to ESP32: {} - {}", commandType, messageJson);
        } catch (Exception e) {
            log.error("Failed to send command to ESP32: {}", commandType, e);
            throw new RuntimeException("Failed to send IoT command", e);
        }
    }

    @PreDestroy
    public void cleanup() {
        if (connection != null) {
            try {
                CompletableFuture<Void> disconnected = connection.disconnect();
                disconnected.get();
                connection.close();
                log.info("AWS IoT connection closed");
            } catch (Exception e) {
                log.error("Error closing AWS IoT connection", e);
            }
        }

        CrtResource.waitForNoResources();
    }
}
