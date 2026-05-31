# Deployment progress

## Done for you (automated)

- [x] **Step 1.1** — `server/.env` configured (`MONGODB_URI`, strong `JWT_SECRET`, `PORT`, `NODE_ENV`)
- [x] Root `.gitignore` — keeps `.env` out of git
- [x] `server/.env.example` — template
- [x] `deploy/ec2/docker-compose.prod.yml` — API + web for EC2
- [x] Helper scripts:
  - `scripts/test-local.ps1` — local Docker test
  - `deploy/ec2/setup-ec2.sh` — install Docker on Ubuntu EC2
  - `scripts/deploy-ec2.sh` — build & run on EC2

## You must do (in order)

### A. MongoDB Atlas (~5 min) — Step 1.2

1. Open https://cloud.mongodb.com → your cluster.
2. **Network Access** → **Add IP Address** → **Allow Access from Anywhere** (`0.0.0.0/0`) for first deploy.
3. Confirm database user password matches `server/.env`.

### B. Local Docker test (~10 min) — Step 1.3

**Docker Desktop must be running** (whale icon → “Engine running”).

```powershell
cd c:\Users\karut\Task-manger
.\scripts\test-local.ps1
```

Or manually:

```powershell
docker compose up -d --build
```

Then open http://localhost:3000 — register and login.

If you see `dockerDesktopLinuxEngine` error → start Docker Desktop and retry.

### C. AWS EC2 (~30 min) — Steps 2–3

1. AWS Console → **EC2** → **Launch instance**
   - Ubuntu 22.04, t3.small, key pair `.pem`, 20 GB
   - Security group: **22** (your IP), **80** and **5000** (0.0.0.0/0)
2. Copy **Public IPv4** → call it `EC2_IP`
3. SSH:

```powershell
ssh -i "C:\path\to\your-key.pem" ubuntu@EC2_IP
```

4. On EC2 install Docker:

```bash
cd ~
# after git clone or scp of project:
cd Task-manger
bash deploy/ec2/setup-ec2.sh
# log out and back in if 'docker' permission denied:
exit
ssh -i "..." ubuntu@EC2_IP
```

### D. Put code on EC2 — Step 5

**Option 1 — SCP from your PC:**

```powershell
scp -i "C:\path\to\your-key.pem" -r "c:\Users\karut\Task-manger" ubuntu@EC2_IP:~/Task-manger
```

**Option 2 — GitHub:** push repo (without `server/.env`), then on EC2 `git clone ...`

### E. Production env on EC2 — Step 6

```bash
nano ~/Task-manger/server/.env
```

Paste same content as your PC `server/.env`, but add (replace `EC2_IP`):

```
CLIENT_ORIGIN=http://EC2_IP,http://EC2_IP:80
```

### F. Deploy on EC2 — Step 6.3

```bash
cd ~/Task-manger
export PUBLIC_HOST=EC2_IP
bash scripts/deploy-ec2.sh
```

### G. Verify — Step 7

- Browser: `http://EC2_IP`
- Register → login → create task

---

## Quick reference

| Step | Who | Status |
|------|-----|--------|
| 1.1 `.env` | Agent | Done |
| 1.2 Atlas network | You | Pending |
| 1.3 Local Docker | You (start Docker Desktop) | Pending |
| 2–3 EC2 + SSH + Docker install | You | Pending |
| 5 Copy code to EC2 | You | Pending |
| 6 `.env` + deploy on EC2 | You | Pending |
| 7 Browser test | You | Pending |
