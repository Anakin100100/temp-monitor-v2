#!/bin/bash

# Simulate IoT device sending temperature and humidity readings every 500ms
# Base values: Temperature 22°C, Humidity 28%
# Variations: ±3 degrees for temperature, ±3% for humidity

API_URL="http://localhost:3000/api/rpc/api-reference/monitoring/addReading"
AUTH_HEADER="X-DEVICE-API-KEY: cc57001ab793e08235fbedabe258c2c6479a17f4f7e931a8742b9fb253731472"
DEVICE_ID="device-001"

echo "Starting IoT device simulation..."
echo "Sending readings every 500ms to: $API_URL"
echo "Device ID: $DEVICE_ID"
echo "Press Ctrl+C to stop"
echo ""

# Base values
BASE_TEMP=22
BASE_HUMIDITY=28

# Counter for readings
count=1

while true; do
    # Generate random variation (-3 to +3)
    temp_variation=$((RANDOM % 7 - 3))  # -3 to +3
    humidity_variation=$((RANDOM % 7 - 3))  # -3 to +3

    # Calculate new values
    temperature=$((BASE_TEMP + temp_variation))
    humidity=$((BASE_HUMIDITY + humidity_variation))

    # Ensure humidity stays within reasonable bounds (0-100)
    if [ $humidity -lt 0 ]; then
        humidity=0
    elif [ $humidity -gt 100 ]; then
        humidity=100
    fi

    # Send the reading
    curl -s -X POST "$API_URL" \
         -H "Content-Type: application/json" \
         -H "$AUTH_HEADER" \
         -d "{\"deviceId\": \"$DEVICE_ID\", \"temperature\": $temperature, \"humidity\": $humidity}" > /dev/null

    echo "Reading #$count: Temperature ${temperature}°C, Humidity ${humidity}% (Variation: T${temp_variation}, H${humidity_variation})"

    # Wait 500ms before next reading
    sleep 0.5

    ((count++))
done