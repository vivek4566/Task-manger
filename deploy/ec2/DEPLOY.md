# Deploy Task Manager on AWS EC2 (Docker)

## Architecture

| Service | Container | Host port | Purpose |
|---------|-----------|-----------|---------|
| `web`   | nginx + React build | 80 | Frontend |
| `api`   | Node.js + Express + Socket.IO | 5000 | REST API + WebSockets |
| MongoDB | **not in Docker** | — | Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (already supported via `MONGODB_URI`) |

---

## Part 1 — Prepare locally

### 1. Fix `server/.env` (never commit this file)

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

- `MONGODB_URI` — Atlas connection string with database name, e.g. `...mongodb.net/taskmanager`
- `JWT_SECRET` — long random string (not `your_jwt_secret_here`)
- `CLIENT_ORIGIN` — set after you know the EC2 URL (see Part 3)

### 2. Test Docker locally

From repo root:

```powershell
# Windows PowerShell
$env:PUBLIC_API_URL = "http://localhost:5000"
$env:PUBLIC_SOCKET_URL = "http://localhost:5000"
$env:CLIENT_ORIGIN = "http://localhost:3000,http://localhost,http://localhost:80"
docker compose up -d --build
```

Production file on EC2:

```bash
docker compose -f deploy/ec2/docker-compose.prod.yml up -d --build
```

- App UI: http://localhost (prod compose) or http://localhost:3000 (root `docker-compose.yml`)
- API health: http://localhost:5000/api/health

### 3. MongoDB Atlas network access

In Atlas → **Network Access** → add:

- Your EC2 **public IP** `/32`, or
- `0.0.0.0/0` only for testing (not recommended for production)

---

## Part 2 — AWS EC2 instance

### 1. Launch instance

- AMI: **Ubuntu 22.04 LTS** (or Amazon Linux 2023)
- Type: `t3.small` or larger
- Key pair: create/download `.pem`
- Storage: 20 GB+

### 2. Security group (inbound)

| Port | Source | Use |
|------|--------|-----|
| 22   | Your IP | SSH |
| 80   | 0.0.0.0/0 | React app |
| 5000 | 0.0.0.0/0 | API + Socket.IO |

### 3. Connect

```bash
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## Part 3 — Install Docker on EC2

**Ubuntu:**

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
sudo usermod -aG docker $USER
newgrp docker
```

Verify: `docker compose version`

---

## Part 4 — Deploy application

### Option A — Git clone (recommended)

```bash
cd ~
git clone <your-repo-url> Task-manger
cd Task-manger
nano server/.env   # paste production values
```

Set build-time URLs (replace with your EC2 public IP or domain):

```bash
export PUBLIC_HOST=3.120.45.67
export PUBLIC_API_URL=http://$PUBLIC_HOST:5000
export PUBLIC_SOCKET_URL=http://$PUBLIC_HOST:5000
export CLIENT_ORIGIN=http://$PUBLIC_HOST,http://$PUBLIC_HOST:80
```

Also add to `server/.env`:

```
CLIENT_ORIGIN=http://3.120.45.67,http://3.120.45.67:80
```

Build and run:

```bash
docker compose -f deploy/ec2/docker-compose.prod.yml up -d --build
docker compose -f deploy/ec2/docker-compose.prod.yml ps
docker compose -f deploy/ec2/docker-compose.prod.yml logs -f
```

### Option B — Copy project with SCP

From your PC:

```powershell
scp -i your-key.pem -r C:\Users\karut\Task-manger ubuntu@<EC2_IP>:~/Task-manger
```

Then SSH in and run the same `export` + `docker compose` commands.

---

## Part 5 — Verify

1. `curl http://localhost:5000/api/health` on EC2 → `{"status":"ok",...}`
2. Browser: `http://<EC2_PUBLIC_IP>` → login page
3. Register/login — confirms API + MongoDB
4. Open two browsers on dashboard — Socket.IO real-time updates

---

## Part 6 — Operations

```bash
# Restart after .env change (API only)
docker compose -f deploy/ec2/docker-compose.prod.yml restart api

# Rebuild frontend after URL change (REACT_APP_* are build-time)
docker compose -f deploy/ec2/docker-compose.prod.yml up -d --build web

# Stop
docker compose -f deploy/ec2/docker-compose.prod.yml down
```

**Auto-start on reboot:** containers use `restart: always`. Ensure Docker starts on boot:

```bash
sudo systemctl enable docker
```

---

## HTTPS (optional, recommended)

1. Point a domain A-record to the EC2 IP.
2. Install Caddy or nginx on the host, or use **AWS Application Load Balancer** + ACM certificate.
3. Rebuild with `https://api.yourdomain.com` and set `CLIENT_ORIGIN=https://yourdomain.com`.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| CORS errors in browser | `CLIENT_ORIGIN` must exactly match the URL in the address bar (scheme + host + port). |
| API works, UI calls wrong host | Rebuild `web` with correct `PUBLIC_API_URL` / `PUBLIC_SOCKET_URL`. |
| MongoDB connection failed | Atlas IP allowlist; correct `MONGODB_URI`; database user password. |
| 401 on all routes | Set a real `JWT_SECRET` in `server/.env`. |
| Socket.IO not connecting | Open port **5000**; `REACT_APP_SOCKET_URL` must be reachable from the browser. |
