
echo "=== Mise à jour du backend ==="

if [ -d "photobooth-backend" ]; then
    cd photobooth-backend
    echo "Mise à jour du backend"
    git fetch origin
    git reset --hard origin/$(git branch --show-current)
    npm cache clean -f && npm update
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
    git fetch origin
    git reset --hard origin/$(git branch --show-current)
    npm cache clean -f && npm update
else
    echo "Erreur : dossier 'photobooth-frontend' introuvable"
    exit 1
fi