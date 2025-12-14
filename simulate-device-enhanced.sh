#!/bin/bash

# IoT Device Simulator for Temperature & Humidity Monitoring
# Generates realistic sensor readings with small variations (±3 degrees, ±3%)
# Sends data every 500ms to match device update frequency

# Configuration
API_URL="http://localhost:3000/api/rpc/api-reference/monitoring/addReading"
AUTH_HEADER="X-DEVICE-API-KEY: cc57001ab793e08235fbedabe258c2c6479a17f4f7e931a8742b9fb253731472"
DEVICE_ID="device-001"

# Base sensor values (adjust as needed)
BASE_TEMP=${BASE_TEMP:-22}
BASE_HUMIDITY=${BASE_HUMIDITY:-28}

# Number of readings to send (default: unlimited)
READING_COUNT=${COUNT:-0}  # 0 = unlimited

echo "🌡 IoT Device Simulator Started"
echo "================================"
echo "API URL: $API_URL"
echo "Device ID: $DEVICE_ID"
echo "Base Temperature: ${BASE_TEMP}°C"
echo "Base Humidity: ${BASE_HUMIDITY}%"
echo "Readings to send: ${READING_COUNT:-unlimited}"
echo "Update interval: 500ms"
echo ""
echo "Press Ctrl+C to stop"
echo ""

count=1
while [ "$READING_COUNT" -eq 0 ] || [ "$count" -le "$READING_COUNT" ]; do
    # Generate random variations (-3 to +3)
    temp_variation=$((RANDOM % 7 - 3))
    humidity_variation=$((RANDOM % 7 - 3))

    # Calculate new sensor values
    temperature=$((BASE_TEMP + temp_variation))
    humidity=$((BASE_HUMIDITY + humidity_variation))

    # Ensure humidity stays within realistic bounds
    if [ "$humidity" -lt 0 ]; then
        humidity=0
    elif [ "$humidity" -gt 100 ]; then
        humidity=100
    fi

    # Send reading to API
    response=$(curl -s -w "%{http_code}" -X POST "$API_URL" \
         -H "Content-Type: application/json" \
         -H "$AUTH_HEADER" \
         -d "{\"deviceId\": \"$DEVICE_ID\", \"temperature\": $temperature, \"humidity\": $humidity}")

    # Check response
    http_code=${response: -3}
    if [ "$http_code" -eq 200 ]; then
        echo "✅ Reading #$count: Temperature ${temperature}°C, Humidity ${humidity}% (Variation: T${temp_variation:+${temp_variation}}, H${humidity_variation:+${humidity_variation}})"
    else
        echo "❌ Reading #$count: Failed (HTTP $http_code)"
        echo "Response: ${response::-3}"
    fi

    # Wait 500ms before next reading
    sleep 0.5

    ((count++))
done

echo ""
echo "🏁 Simulation completed!"