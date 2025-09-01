
#!/bin/bash

# Run all tests with coverage
echo "Running unit and integration tests..."
npm run test:unit

echo "Running E2E tests..."
npm run test:e2e

echo "Running accessibility tests..."
npm run test:a11y

echo "Generating coverage report..."
npm run test:coverage

echo "Running performance tests..."
npm run test:performance

echo "All tests completed!"
