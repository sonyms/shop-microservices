Write-Host "Starting Database Migration to Kubernetes..." -ForegroundColor Green

Write-Host "`n1. Scaling down microservices to prevent active connections..." -ForegroundColor Cyan
kubectl scale deployment --replicas=0 api-gateway auth-service cart-service order-service product-service user-service notification-service
Start-Sleep -Seconds 5

Write-Host "`n2. Exporting data from old Docker Compose container (shop-postgres)..." -ForegroundColor Cyan
cmd.exe /c "docker exec shop-postgres pg_dump -c -U shop_user shop_db > dump.sql"
if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to export data. Is the shop-postgres container running?" -ForegroundColor Red
    Write-Host "Run 'docker-compose up -d postgres' first to start it." -ForegroundColor Yellow
    exit 1
}

Write-Host "`n2. Finding the new Kubernetes Postgres pod..." -ForegroundColor Cyan
$podName = kubectl get pods -l app=postgres -o jsonpath="{.items[0].metadata.name}"

if (-not $podName) {
    Write-Host "Could not find Kubernetes Postgres pod!" -ForegroundColor Red
    Write-Host "Please ensure you have run '.\deploy-k8s.ps1' to start the cluster first." -ForegroundColor Yellow
    exit 1
}
Write-Host "Found pod: $podName" -ForegroundColor DarkCyan

Write-Host "`n3. Copying SQL dump into the new pod..." -ForegroundColor Cyan
kubectl cp dump.sql "${podName}:/tmp/dump.sql"

Write-Host "`n4. Restoring data..." -ForegroundColor Cyan
kubectl exec -i $podName -- psql -U shop_user -d shop_db -f /tmp/dump.sql

Write-Host "`n4.5. Scaling microservices back up..." -ForegroundColor Cyan
kubectl scale deployment --replicas=1 api-gateway auth-service cart-service order-service product-service user-service notification-service

Write-Host "`n5. Cleaning up local backup file..." -ForegroundColor Cyan
Remove-Item dump.sql

Write-Host "`n=======================================================" -ForegroundColor Green
Write-Host "Migration Complete!" -ForegroundColor Green
Write-Host "All your old users and data are now permanently stored in Kubernetes." -ForegroundColor White
Write-Host "=======================================================" -ForegroundColor Green
