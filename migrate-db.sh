#!/bin/bash

# Exit on any error
set -e

echo -e "\e[32mStarting Database Migration to Kubernetes...\e[0m"

echo -e "\n\e[36m1. Scaling down microservices to prevent active connections...\e[0m"
kubectl scale deployment --replicas=0 api-gateway auth-service cart-service order-service product-service user-service notification-service
sleep 5

echo -e "\n\e[36m2. Exporting data from old Docker Compose container (shop-postgres)...\e[0m"
if ! docker exec shop-postgres pg_dump -c -U shop_user shop_db > dump.sql; then
    echo -e "\e[31mFailed to export data. Is the shop-postgres container running?\e[0m"
    echo -e "\e[33mRun 'docker-compose up -d postgres' first to start it.\e[0m"
    exit 1
fi

echo -e "\n\e[36m2. Finding the new Kubernetes Postgres pod...\e[0m"
podName=$(kubectl get pods -l app=postgres -o jsonpath="{.items[0].metadata.name}")

if [ -z "$podName" ]; then
    echo -e "\e[31mCould not find Kubernetes Postgres pod!\e[0m"
    echo -e "\e[33mPlease ensure you have run the Kubernetes deployment scripts to start the cluster first.\e[0m"
    exit 1
fi

echo -e "\e[36mFound pod: $podName\e[0m"

echo -e "\n\e[36m3. Copying SQL dump into the new pod...\e[0m"
kubectl cp dump.sql "${podName}:/tmp/dump.sql"

echo -e "\n\e[36m4. Restoring data...\e[0m"
kubectl exec -i $podName -- psql -U shop_user -d shop_db -f /tmp/dump.sql

echo -e "\n\e[36m4.5. Scaling microservices back up...\e[0m"
kubectl scale deployment --replicas=1 api-gateway auth-service cart-service order-service product-service user-service notification-service

echo -e "\n\e[36m5. Cleaning up local backup file...\e[0m"
rm dump.sql

echo -e "\n\e[32m=======================================================\e[0m"
echo -e "\e[32mMigration Complete!\e[0m"
echo -e "\e[37mAll your old users and data are now permanently stored in Kubernetes.\e[0m"
echo -e "\e[32m=======================================================\e[0m"
