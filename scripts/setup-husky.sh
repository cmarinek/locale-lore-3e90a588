#!/bin/bash

# Setup Husky hooks
npx husky install

# Add pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"

# Add commit-msg hook for conventional commits
npx husky add .husky/commit-msg 'npx --no -- commitlint --edit ${1}'

echo "Husky setup complete!"