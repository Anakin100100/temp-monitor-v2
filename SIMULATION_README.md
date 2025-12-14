# IoT Device Simulation Scripts

This repository includes two scripts to simulate IoT device readings for testing the temperature and humidity monitoring system.

## Scripts Available

### 1. `simulate-device.sh` - Basic Simulator
- Simple continuous simulation
- Fixed base values (22°C, 28%)
- Runs indefinitely until stopped
- Basic output format

**Usage:**
```bash
./simulate-device.sh
# Press Ctrl+C to stop
```

### 2. `simulate-device-enhanced.sh` - Advanced Simulator
- Configurable parameters via environment variables
- HTTP response validation
- Better error handling
- Progress tracking
- Can limit number of readings

**Usage:**
```bash
# Default settings (22°C, 28%, unlimited readings)
./simulate-device-enhanced.sh

# Custom settings
BASE_TEMP=25 BASE_HUMIDITY=40 COUNT=100 ./simulate-device-enhanced.sh

# Environment variables:
# - BASE_TEMP: Base temperature in °C (default: 22)
# - BASE_HUMIDITY: Base humidity in % (default: 28)
# - COUNT: Number of readings to send (default: 0 = unlimited)
```

### 3. One-Liner Command
For quick testing without creating files:

```bash
# Send 50 readings with default values
BASE_TEMP=22 BASE_HUMIDITY=28 COUNT=50 bash -c 'for i in $(seq 1 $COUNT); do TEMP_VAR=$((RANDOM % 7 - 3)); HUMIDITY_VAR=$((RANDOM % 7 - 3)); TEMP=$((BASE_TEMP + TEMP_VAR)); HUMIDITY=$((BASE_HUMIDITY + HUMIDITY_VAR)); if [ $HUMIDITY -lt 0 ]; then HUMIDITY=0; elif [ $HUMIDITY -gt 100 ]; then HUMIDITY=100; fi; curl -s -X POST http://localhost:3000/api/rpc/api-reference/monitoring/addReading -H "Content-Type: application/json" -H "X-DEVICE-API-KEY: cc57001ab793e08235fbedabe258c2c6479a17f4f7e931a8742b9fb253731472" -d "{\"deviceId\": \"device-001\", \"temperature\": $TEMP, \"humidity\": $HUMIDITY}" > /dev/null && echo "Reading #$i: Temperature ${TEMP}°C, Humidity ${HUMIDITY}% (Var: T${TEMP_VAR}, H${HUMIDITY_VAR})"; sleep 0.5; done'
```

## Simulation Details

- **Update Frequency**: 500ms (matches device specification)
- **Temperature Variation**: ±3°C from base value
- **Humidity Variation**: ±3% from base value
- **Device ID**: `device-001`
- **Authentication**: Uses secure API key
- **API Endpoint**: `http://localhost:3000/api/rpc/api-reference/monitoring/addReading`

## Monitoring Dashboard

View the live charts at: `http://localhost:3000/monitoring`

The dashboard will show:
- Real-time temperature line graph (red)
- Real-time humidity line graph (blue)
- Live statistics panel
- Data updates every 500ms when simulation is running