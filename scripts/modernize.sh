#!/bin/bash

set -e

PHASES="${1:-all}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🎨 Starting UI Modernization - CashApp Style"
echo "Phases: $PHASES"

# Function to run a specific phase
run_phase() {
    local phase=$1
    echo "▶️  Running phase: $phase"
    
    case $phase in
        "header")
            node "$SCRIPT_DIR/modernize/header.js"
            ;;
        "search")
            node "$SCRIPT_DIR/modernize/search.js"
            ;;
        "markers")
            node "$SCRIPT_DIR/modernize/markers.js"
            ;;
        "bottom-bar")
            node "$SCRIPT_DIR/modernize/bottom-bar.js"
            ;;
        "views")
            node "$SCRIPT_DIR/modernize/views.js"
            ;;
        *)
            echo "❌ Unknown phase: $phase"
            exit 1
            ;;
    esac
    
    echo "✅ Completed phase: $phase"
}

# Parse phases
if [ "$PHASES" = "all" ]; then
    PHASES="header,search,markers,bottom-bar,views"
fi

# Convert comma-separated list to array
IFS=',' read -ra PHASE_ARRAY <<< "$PHASES"

# Run each phase
for phase in "${PHASE_ARRAY[@]}"; do
    phase=$(echo "$phase" | xargs) # trim whitespace
    run_phase "$phase"
done

echo "🎉 All phases completed successfully!"