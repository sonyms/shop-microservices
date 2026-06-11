# Shop Microservices Platform

A modern, highly-scalable, and secure e-commerce platform built with a **Java Spring Boot** microservices architecture and a **React** frontend. Designed with production-readiness in mind, featuring event-driven communication, advanced caching, centralized observability, and a GitOps deployment workflow.

## 🚀 Architecture Overview

*   **Frontend:** React (Vite) + Tailwind CSS (Responsive, Modern UI)
*   **Backend Services:** Spring Boot 3 + Spring Cloud (Eureka, API Gateway)
*   **Database:** PostgreSQL (with Liquibase schema migrations)
*   **Caching:** Redis (with Cache Stampede prevention mechanisms)
*   **Message Broker:** Apache Kafka (Event-driven asynchronous processing)
*   **Security:** Stateless JWT Authentication with strict API Gateway header validation
*   **Observability:** Prometheus, Grafana, Loki (Promtail), and Zipkin distributed tracing
*   **CI/CD:** Jenkins + ArgoCD (GitOps)

## 📦 Microservices Ecosystem

| Service | Port | Description |
| :--- | :--- | :--- |
| `frontend` | 5173 | React UI for browsing products, managing cart, and orders. |
| `api-gateway` | 8080 | Single entry point, handles CORS, JWT validation, and routing. |
| `auth-service` | 8081 | User registration, login, and JWT generation (BCrypt hashing). |
| `product-service` | 8082 | Product catalog management with Redis-backed caching strategies. |
| `cart-service` | 8083 | Manages active shopping carts and user sessions. |
| `order-service` | 8085 | Processes checkouts and orchestrates the order lifecycle. |
| `notification-service`| 8086 | Listens to Kafka events and handles user notifications. |
| `discovery-server` | 8761 | Netflix Eureka server for internal service registration. |

## 🛡️ Security Posture
*   **Zero-Trust Gateway:** API Gateway performs stateless JWT validation and strictly strips spoofed `X-Auth-*` HTTP headers before routing to backend services.
*   **Internal Role Authorization:** Backend controllers utilize a custom `@RequireRole("ADMIN")` aspect, trusting only validated Gateway headers.
*   **Secret Management:** No hardcoded secrets. Passwords and JWT signing keys are injected securely via Environment Variables / Kubernetes Secrets.

---

## 🛠️ Local Development Setup

To run the platform locally on your machine, you need Docker, Java 21, Maven, and Node.js installed.

**1. Start the Infrastructure & Restore Sample Data**
Start the databases, Kafka broker, and monitoring tools using Docker Compose:
```bash
docker-compose up -d
```
Once the `shop-postgres` container is running, restore the sample data so your store has products to display:
```bash
docker exec -i shop-postgres psql -U shop_user -d shop_db < dump.sql
```

**2. Start the Microservices**
Open separate terminal windows and start the Spring Boot services in this order:
```bash
# Terminal 1
cd discovery-server && mvn spring-boot:run

# Terminal 2 (Wait for Eureka to boot up first)
cd api-gateway && mvn spring-boot:run

# Terminal 3, 4, 5... (Start the rest)
cd auth-service && mvn spring-boot:run
cd product-service && mvn spring-boot:run
# ... start cart, order, user, and notification services
```

**3. Start the Frontend**
```bash
cd frontend
npm install
npm run dev
```
Navigate to `http://localhost:5173` to view the application!

---

## ☁️ Cloud & Kubernetes Deployment

This project is fully ready for Kubernetes and utilizes an ArgoCD GitOps workflow for continuous deployment.

### Managed Cloud Architecture (AWS Example)
For production deployments, it is recommended to replace the local infrastructure with managed cloud services to guarantee high availability and scale:
*   **Compute:** Amazon EKS (Elastic Kubernetes Service) for all stateless microservices and ArgoCD.
*   **Database:** Amazon Aurora PostgreSQL Serverless v2 (Auto-scaling relational database).
*   **Caching:** Amazon ElastiCache for Redis (Sub-millisecond latency for product catalog and sessions).
*   **Event Broker:** Amazon MSK (Managed Streaming for Apache Kafka) for reliable asynchronous events.

*Budget Alternative:* You can significantly reduce cloud costs by using "In-Cluster Hosting"—deploying open-source PostgreSQL, Redis, and Kafka directly onto your Kubernetes worker nodes via Helm charts.

### Continuous Deployment (Jenkins + ArgoCD)
1. The included `Jenkinsfile` packages the Java applications and builds Docker images.
2. It pushes the images to Docker Hub (`sonyms2023/...`).
3. Jenkins updates the YAML files in the `gitops/apps/` directory and commits them back to GitHub.
4. **ArgoCD** (running in Kubernetes) detects the new GitHub commit and automatically syncs the cluster with zero downtime.

**Migrating Local Data to Kubernetes**
If you have data in your local Docker Postgres container that you want to move into your new Kubernetes cluster, run the migration script for your operating system:

**Windows (PowerShell):**
```powershell
.\migrate-db.ps1
```

**Linux / macOS (Bash):**
```bash
bash migrate-db.sh
```

## 📊 Observability

When the infrastructure is running, you can access the centralized monitoring tools:
*   **Grafana Dashboards:** `http://localhost:3000` (Metrics & Logs combined)
*   **Prometheus Targets:** `http://localhost:9090`
*   **Zipkin Traces:** `http://localhost:19411` (Distributed request tracing)

---

## 📈 Load Testing

Included a comprehensive load testing script (`load-test.js`) in the root directory. This script uses [k6](https://k6.io/) to simulate a real-world Black Friday traffic surge.

### How the Test Works
The script runs a realistic user simulation with the following stages:
1. **Ramp Up:** Slowly ramps up to 100 concurrent virtual users over 30 seconds.
2. **Authentication:** Each user randomly selects an identity (`testuser1` to `testuser1000`), hits the `/auth/login` endpoint, and securely extracts their JWT.
3. **Shopping:** Users randomly select products and add them to their shopping cart (`/cart/{id}/add`).
4. **Checkout:** Users immediately execute a checkout transaction (`/orders/{id}/checkout`).

### How to Run It

**1. Seed the Database**
Before running the test, you MUST seed your database with the 1,000 test users and 1,000 products that the script expects. Run the following command to execute `seed.sql`:

```bash
docker exec -i shop-postgres psql -U shop_user -d shop_db < seed.sql
```

**2. Execute the Load Test**
If you have Docker installed, you can run the test immediately without installing k6 on your machine:

```bash
docker run --rm -i grafana/k6 run - < load-test.js
```

While the test is running, open your **Grafana Dashboards** at `http://localhost:3000` to watch the real-time spikes in CPU, memory, database connections, and API latency!
