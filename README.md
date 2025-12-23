
Start photobooth on raspberry starting
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
{photobooth_backend}/start.sh


Stop photobooth

sudo visudo
Ajoute à la fin :
pi ALL=(ALL) NOPASSWD: /sbin/shutdown
(ou adapte l’utilisateur si ce n’est pas pi)

🔹 Vérifie le chemin :
which shutdown
Souvent :
/sbin/shutdown