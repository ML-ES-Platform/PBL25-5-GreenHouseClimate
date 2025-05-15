# Stage 1: Build the application
FROM maven:3.8.3-openjdk-17 AS BUILD_IMAGE

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=BUILD_IMAGE /app/target/*.jar ./GreenhouseBackend.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "GreenhouseBackend.jar"]
