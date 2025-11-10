

echo "=== Démarrage du backend ==="

if [ -d "photobooth-backend" ]; then
    cd photobooth-backend
    echo "Démarrage du backend en arrière-plan..."
    npm run build && node --max-old-space-size=256 dist/main.js
    BACKEND_PID=$!
    cd ..
else
    echo "Erreur : dossier 'photobooth-backend' introuvable"
    exit 1
fi

echo ""
echo "=== Démarrage du frontend ==="

if [ -d "photobooth-frontend" ]; then
    cd photobooth-frontend
    echo "Démarrage du frontend..."
    npm run start
else
    echo "Erreur : dossier 'photobooth-frontend' introuvable"
    exit 1
fi

# Optionnel : attendre la fin du backend si nécessaire
wait $BACKEND_PID