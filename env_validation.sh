#!/bin/bash

# Task 10: Environment Variable Validation Script
# Checks for the presence of all required Supabase environment variables.

REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "SUPABASE_JWT_SECRET"
)

ENV_FILES=(".env.local" ".env.development" ".env.production")
ALL_VALID=true

echo "--- Running Environment Variable Validation Script (Task 10) ---"

for ENV_FILE in "${ENV_FILES[@]}"; do
    echo -e "\n[Validating $ENV_FILE]"
    FILE_VALID=true
    
    # Check if file exists
    if [ ! -f "$ENV_FILE" ]; then
        echo "  ❌ File not found."
        ALL_VALID=false
        continue
    fi

    # Load variables from file (basic loading for checking presence)
    # This is a simple check and does not handle complex shell escaping, but is sufficient for this task.
    while IFS='=' read -r key value; do
        if [[ "$key" =~ ^[A-Z_]+$ ]]; then
            export "$key=$value"
        fi
    done < "$ENV_FILE"

    for VAR in "${REQUIRED_VARS[@]}"; do
        # Check if variable is set and not empty
        if [[ -z "${!VAR}" ]]; then
            echo "  ❌ MISSING: $VAR"
            FILE_VALID=false
        else
            # Check if the value is the placeholder
            if [[ "${!VAR}" == "<<PROJECT VALUE>>" ]]; then
                echo "  ⚠️ PLACEHOLDER: $VAR"
                FILE_VALID=false
            else
                echo "  ✅ OK: $VAR"
            fi
        fi
    done

    if $FILE_VALID; then
        echo "  ✅ $ENV_FILE is valid."
    else
        echo "  ❌ $ENV_FILE has missing or placeholder values."
        ALL_VALID=false
    fi
done

echo -e "\n--- Validation Summary ---"
if $ALL_VALID; then
    echo "✅ All environment files are configured correctly."
    exit 0
else
    echo "❌ One or more environment files require attention."
    exit 1
fi
