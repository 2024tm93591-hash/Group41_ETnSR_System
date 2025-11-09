# Event Ticketing & Seat Reservation System
## Overview
This system is a microservices-based Event Ticketing & Seat Reservation platform. It handles user registration, event creation, seat reservation, order placement, ticket issuance, and payment processing.

# Microservices
- User Service: Manages user authentication and profiles.
- Catalog Service: Manages venues, events, and seat definitions.
- Seating Service: Handles seat availability, reservation, and allocation.
- Order Service: Manages orders and ticket generation.
- Payment Service: Processes payments and refunds.
- Notification Service: Sends email/SMS notifications.

# Database-per-Service
Each service has its own database (MSSQL) for loose coupling and independent scaling.

# Inter-Service Communication
REST APIs are used for communication between services.

# Project Structure
<!-- SS/
├── catalog-service/
├── notification-service/
├── order-service/
├── payment-service/
├── seating-service/
├── user-service/
├── seed-data/
├── k8s/
│   ├── secrets.yaml
│   ├── configmaps/
│   ├── pvcs/
│   ├── deployments/
│   ├── databases/
│   └── monitoring/
├── docker-compose.yml
├── README.md
├── wait-for-it.sh
└── seedDataToDB.js -->

# Workflow
1. User registers via User Service (/v1/users/register)
2. Browse events via Catalog Service (/v1/events)
3. Check available seats via Seating Service (/v1/seats?eventId=<id>)
4. Reserve seats (/v1/seats/reserve)
5. Place order via Order Service (/v1/orders)
6. Process payment via Payment Service (/v1/payments/charge)
7. Seats allocated (/v1/seats/allocate)
8. Notifications sent via Notification Service (email/SMS)

# Local Setup (Docker Compose)
1. Build Docker images:
   docker-compose build

2. Start all services:
   docker-compose up

3. Verify containers:
   docker ps

4. Seed initial data:
   node seedDataToDB.js

5. Test API endpoints using Postman or curl:
   curl -X POST http://localhost:3000/v1/users/register -H 'Content-Type: application/json' -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'

# Kubernetes Setup (Minikube / K8s Cluster)
1. Start Minikube:
   minikube start

2. Apply all YAMLs:
   kubectl apply -f ./k8s

3. Verify Deployments:
   kubectl get pods -A
   kubectl get svc -A

4. Monitor Logs:
   kubectl logs <pod-name>

5. Access Prometheus:
   minikube service prometheus -n monitoring

# Secrets and ConfigMaps
Secrets:
- user-service-secret
- catalog-service-secret
- seating-service-secret
- order-service-secret
- payment-service-secret

ConfigMaps:
- order-service-config.yaml
- notification-config.yaml

# Persistent Volumes:
PVCs defined for each service database to persist data.

# Testing
- Inter-service workflow: Reserve seats, place orders, complete payments.
- API endpoints: Use Postman or curl.
- Monitoring: Prometheus metrics for orders, payments, emails, etc.

# Troubleshooting
- ImagePullBackOff: Check Docker image names or build locally.
- Service dependency errors: Use 'kubectl describe pod <pod>' to check readiness probes.
- Database connection issues: Ensure PVCs and secrets are applied.
- Apply YAML validation issues: Use '--validate=false' if needed.

# Future Improvements
- Distributed tracing (Jaeger/Zipkin).
- Retry logic for inter-service communication.
- More robust error handling and input validation.
- CI/CD integration for automated deployments.
