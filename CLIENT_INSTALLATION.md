# 🎯 Pour le client : Guide d'installation

## 👋 Bienvenue !

Votre application est **100% prête à être lancée avec Docker**.

Suivez ce guide. C'est très simple.

---

## 📋 Étape 1 : Installer Docker (5 min)

### Windows

1. Télécharger [Docker Desktop pour Windows](https://www.docker.com/products/docker-desktop)
2. Lancer l'installateur
3. Redémarrer l'ordinateur
4. Vérifier : ouvrir PowerShell et taper `docker --version`

### Mac

1. Télécharger [Docker Desktop pour Mac](https://www.docker.com/products/docker-desktop)
2. Lancer l'installateur
3. Copier Docker dans Applications
4. Vérifier : ouvrir Terminal et taper `docker --version`

### Linux

```bash
# Ubuntu / Debian
sudo apt-get install docker.io docker-compose
docker --version
```

---

## 🚀 Étape 2 : Lancer l'application (2 min)

### Windows (PowerShell)

```powershell
# Ouvrir PowerShell
# Naviguer au dossier du projet
cd C:\chemin\vers\le\projet

# Lancer
docker compose up --build

# Attendre 15 secondes...
```

### Mac / Linux (Terminal)

```bash
# Ouvrir Terminal
# Naviguer au dossier du projet
cd /chemin/vers/le/projet

# Lancer
docker compose up --build

# Attendre 15 secondes...
```

---

## ✅ Étape 3 : Vérifier que ça marche (1 min)

Une fois que vous voyez :

```
app_frontend exited with code 0
app_backend running
app_db running
```

Ouvrir votre navigateur et aller à :

| Quoi          | URL                   |
| ------------- | --------------------- |
| L'application | http://localhost:3000 |
| L'API         | http://localhost:8000 |

**✨ Voilà ! L'application fonctionne !**

---

## 📱 Utiliser l'application

### En local (développement)

```bash
docker compose up --build
```

**Ouvrir :** http://localhost:3000

### Arrêter

Dans le terminal, appuyer sur `Ctrl + C`

### Relancer

```bash
docker compose up
```

---

## 🔐 Identifiants

Si vous avez besoin d'accéder directement à la base de données :

```
Serveur  : localhost:3306
Utilisateur : user
Mot de passe : password

Root : root / root

Base de données : backoffice
```

---

## 🔧 Commandes utiles

### Voir ce qui se passe

```bash
# Tous les logs
docker compose logs -f

# Juste le backend
docker compose logs -f backend

# Juste le frontend
docker compose logs -f frontend
```

### Accéder à un container

```bash
# Terminal dans le backend (Laravel)
docker compose exec backend bash

# Terminal dans le frontend (React)
docker compose exec frontend sh

# Terminal dans la DB
docker compose exec db mysql -uuser -ppassword backoffice
```

### Nettoyer et recommencer

```bash
# Arrêter et supprimer tout (y compris les données)
docker compose down -v

# Relancer à zéro
docker compose up --build
```

---

## 🚨 Si ça ne marche pas

### "docker: command not found"

→ Docker n'est pas installé. Relire Étape 1.

### "Port 3000 is already in use"

→ Un autre programme utilise le port 3000.

**Solution :**

- Windows : Ouvrir PowerShell, taper `netstat -ano | findstr :3000`
- Mac/Linux : Ouvrir Terminal, taper `lsof -i :3000`

Puis tuer le process qui occupe le port (ou redémarrer l'ordinateur).

### Frontend ou Backend ne démarre pas

```bash
# Voir les logs
docker compose logs

# Relancer à zéro
docker compose down -v
docker compose up --build
```

---

## 📞 Support technique

Si vous avez des problèmes :

1. **Lire [DOCKER_START_HERE.md](./DOCKER_START_HERE.md)** - réponses aux problèmes courants
2. **Lancer `docker compose logs`** - voir ce qui se passe
3. **Contacter le développeur** - avec les logs en pièce jointe

---

## ✅ Résumé

| Étape | Quoi faire                                |
| ----- | ----------------------------------------- |
| 1️⃣    | Installer Docker Desktop                  |
| 2️⃣    | Ouvrir terminal dans le dossier du projet |
| 3️⃣    | Taper `docker compose up --build`         |
| 4️⃣    | Attendre 15 secondes                      |
| 5️⃣    | Ouvrir http://localhost:3000              |

**C'est tout ! 🎉**

---

## 📚 Documentation technique

Si un développeur doit travailler sur le projet :

- [DOCKER_START_HERE.md](./DOCKER_START_HERE.md) - Guide général
- [DOCKER_DEPLOYMENT_SIMPLE.md](./DOCKER_DEPLOYMENT_SIMPLE.md) - Configuration et troubleshooting
- [README_DOCKER.md](./README_DOCKER.md) - Architecture technique
