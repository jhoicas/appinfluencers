# PowerShell script to run tests with coverage

Write-Host "🧪 Running tests..." -ForegroundColor Cyan

# Run pytest with coverage
pytest tests/ `
    --cov=app `
    --cov-report=term-missing `
    --cov-report=html `
    -v

# Check exit code
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ All tests passed!" -ForegroundColor Green
    Write-Host "📊 Coverage report generated in htmlcov/index.html" -ForegroundColor Yellow
} else {
    Write-Host "❌ Some tests failed" -ForegroundColor Red
    exit 1
}
