
echo "=== Mise à jour du code ==="

git fetch origin
git reset --hard origin/$(git branch --show-current)

echo "=== Mise à jour du backend ==="

if [ -d "photobooth-backend" ]; then
    cd photobooth-backend
    echo "Mise à jour du backend"
    npm cache clean -f && npm install
    cd ..
else
    echo "Erreur : dossier 'photobooth-backend' introuvable"
    exit 1
fi

echo ""
echo "=== Mise à jour du frontend ==="

if [ -d "photobooth-frontend" ]; then
    cd photobooth-frontend
    echo "Mise à jour du frontend..."
    npm cache clean -f && npm install
else
    echo "Erreur : dossier 'photobooth-frontend' introuvable"
    exit 1
fi