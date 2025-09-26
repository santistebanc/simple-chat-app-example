# Docker Compose Setup

This project includes a `docker-compose.yml` file for easy deployment and development.

## Services

### Production Service (`chat-app`)
- **Container**: `geckos-chat-app`
- **HTTP Port**: 3000
- **UDP Ports**: 10000-10007 (for WebRTC)
- **Environment**: Production

### Development Service (`chat-app-dev`)
- **Container**: `geckos-chat-app-dev`
- **HTTP Port**: 3001
- **UDP Ports**: 10010-10017 (for WebRTC)
- **Environment**: Development
- **Volumes**: Live code reloading

## Usage

### Start Production Service
```bash
docker-compose up -d chat-app
```

### Start Development Service
```bash
docker-compose --profile dev up -d chat-app-dev
```

### Start Both Services
```bash
docker-compose --profile dev up -d
```

### View Logs
```bash
# Production logs
docker-compose logs -f chat-app

# Development logs
docker-compose logs -f chat-app-dev
```

### Stop Services
```bash
docker-compose down
```

## Environment Variables

- `NODE_ENV`: Set to `production` or `development`
- `PORT_RANGE_MIN`: Minimum UDP port for WebRTC (default: 10000)
- `PORT_RANGE_MAX`: Maximum UDP port for WebRTC (default: 10007)

## Access

- **Production**: http://localhost:3000
- **Development**: http://localhost:3001

## Port Requirements

Make sure the following ports are available:
- **TCP 3000**: HTTP server
- **UDP 10000-10007**: WebRTC communication (production)
- **UDP 10010-10017**: WebRTC communication (development)
