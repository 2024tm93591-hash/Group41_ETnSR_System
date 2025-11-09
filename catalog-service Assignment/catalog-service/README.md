Catalog Service - Quick Start

Steps:
1. Install Java 17 and Maven.
2. Build: mvn clean package
3. Run: mvn spring-boot:run  OR java -jar target/catalog-service-0.0.1-SNAPSHOT.jar
4. API docs: http://localhost:8080/swagger-ui.html
5. H2 console: http://localhost:8080/h2-console (JDBC URL: jdbc:h2:mem:catalogdb)
