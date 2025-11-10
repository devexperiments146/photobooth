#!/bin/bash

set -e  # Arrête le script en cas d'erreur

echo "=== Installation de Node.js et npm ==="

sudo apt update
sudo apt upgrade -y

# Installer Node.js LTS depuis le dépôt officiel
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.6/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 20
nvm use 20
nvm alias default 20

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

export NODE_OPTIONS="--max-old-space-size=512"

echo ""
echo "=== Copie fichier racine photobooth-backend ==="
read
echo ""
echo "=== Configuration des variables d'environnement ==="

read -p "Entrez le chemin vers Google Credentials (GOOGLE_CREDENTIALS_PATH) : " GOOGLE_CREDENTIALS_PATH
read -p "Entrez le JWT Secret (JWT_SECRET) : " JWT_SECRET
read -p "Entrez le Folder ID (FOLDER_ID) : " FOLDER_ID

cat > photobooth-backend/.env <<EOL
GOOGLE_CREDENTIALS_PATH=$GOOGLE_CREDENTIALS_PATH
GOOGLE_SCOPES_API=https://www.googleapis.com/auth/drive
JWT_SECRET=$JWT_SECRET
FOLDER_ID=$FOLDER_ID
REDIRECT_TO_LOGIN=http://localhost:3000/camera
EOL

echo ".env créé avec succès !"

echo ""
echo "=== Installation et démarrage du backend ==="

if [ -d "photobooth-backend" ]; then
    cd photobooth-backend
    npm install
    echo "Démarrage du backend en arrière-plan..."
    npm run build && node --max-old-space-size=256 dist/main.js
    BACKEND_PID=$!
    cd ..
else
    echo "Erreur : dossier 'photobooth-backend' introuvable"
    exit 1
fi

echo ""
echo "=== Installation et démarrage du frontend ==="

if [ -d "photobooth-frontend" ]; then
    cd photobooth-frontend
    npm install
    echo "Démarrage du frontend..."
    npm run start
else
    echo "Erreur : dossier 'photobooth-frontend' introuvable"
    exit 1
fi

# Optionnel : attendre la fin du backend si nécessaire
wait $BACKEND_PID