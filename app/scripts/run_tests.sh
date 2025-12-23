#!/bin/bash
# Script to run tests with coverage

echo "🧪 Running tests..."

# Run pytest with coverage
pytest tests/ \
    --cov=app \
    --cov-report=term-missing \
    --cov-report=html \
    -v

# Check exit code
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
    echo "📊 Coverage report generated in htmlcov/index.html"
else
    echo "❌ Some tests failed"
    exit 1
fi
