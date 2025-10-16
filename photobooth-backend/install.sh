#!/bin/bash

set -e  # Arrête le script en cas d'erreur

echo "=== Installation de Node.js et npm ==="

sudo apt update
sudo apt upgrade -y

# Installer Node.js LTS depuis le dépôt officiel
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt install -y nodejs

echo "Node.js version: $(node -v)"
echo "npm version: $(npm -v)"

echo ""
echo "=== Configuration des variables d'environnement ==="

read -p "Entrez le chemin vers Google Credentials (GOOGLE_CREDENTIALS_PATH) : " GOOGLE_CREDENTIALS_PATH
read -p "Entrez le JWT Secret (JWT_SECRET) : " JWT_SECRET
read -p "Entrez le Folder ID (FOLDER_ID) : " FOLDER_ID

cat > .env <<EOL
GOOGLE_CREDENTIALS_PATH="$GOOGLE_CREDENTIALS_PATH"
GOOGLE_SCOPES_API=https://www.googleapis.com/auth/drive
JWT_SECRET="$JWT_SECRET"
FOLDER_ID="$FOLDER_ID"
REDIRECT_TO_LOGIN=http://localhost:3000/camera
EOL

echo ".env créé avec succès !"

echo ""
echo "=== Installation et démarrage du backend ==="

if [ -d "photobooth-backend" ]; then
    cd photobooth-backend
    npm install
    echo "Démarrage du backend en arrière-plan..."
    npm run start &
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