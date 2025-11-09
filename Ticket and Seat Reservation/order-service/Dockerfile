FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build
COPY . .
# Build the application (skip tests to speed up builds)
RUN ./mvnw -B -DskipTests package || mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
ARG JAR_FILE=target/*.jar
COPY --from=builder /build/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
