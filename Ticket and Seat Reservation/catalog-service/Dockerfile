FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /build
# Copy inner module and build
COPY catalog-service/ ./catalog-service/
WORKDIR /build/catalog-service
RUN ./mvnw -B -DskipTests package || mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=builder /build/catalog-service/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
