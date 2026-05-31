#!/bin/bash
# Run on EC2 after SSH (Ubuntu 22.04): bash deploy/ec2/setup-ec2.sh
set -euo pipefail

echo "==> Installing Docker..."
sudo apt-get update -qq
sudo apt-get install -y ca-certificates curl git

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -qq
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

sudo usermod -aG docker "$USER"
sudo systemctl enable docker
sudo systemctl start docker

echo "==> Docker installed:"
docker compose version

echo ""
echo "Next: set PUBLIC_HOST to your EC2 public IP, then run:"
echo "  export PUBLIC_HOST=YOUR_EC2_IP"
echo "  export PUBLIC_API_URL=http://\$PUBLIC_HOST:5000"
echo "  export PUBLIC_SOCKET_URL=http://\$PUBLIC_HOST:5000"
echo "  export CLIENT_ORIGIN=http://\$PUBLIC_HOST,http://\$PUBLIC_HOST:80"
echo "  docker compose -f deploy/ec2/docker-compose.prod.yml up -d --build"
