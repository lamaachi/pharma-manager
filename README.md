# PharmaManager 💊

Application de gestion de pharmacie

## Stack Technique

| Composant | Technologie |
|---|---|
| Backend | Django 5.x + Django REST Framework |
| Frontend | React (Vite + TypeScript) |
| Base de données | PostgreSQL 15 |
| Conteneurisation | Docker + Docker Compose |
| Documentation API | Swagger (drf-spectacular) |
| Serveur Web | Nginx (pour le frontend en production) |

---

## 🐳 Lancer avec Docker (Recommandé)

C'est la méthode la plus simple. Un seul prérequis : **Docker Desktop** installé.

### 1. Cloner le projet
```bash
git clone <url-du-repo>
cd PharmaManager
```

### 2. Configurer les variables d'environnement
```bash
cp pharma-backend/.env.exemple pharma-backend/.env
```
Modifiez les valeurs dans `.env` si nécessaire (voir section Variables d'Environnement).

### 3. Lancer tous les services
```bash
docker-compose up -d --build
```

Le backend s'occupe automatiquement de :
- ✅ Attendre que la base de données soit prête
- ✅ Appliquer les migrations
- ✅ Seeder les données de test
- ✅ Démarrer le serveur

### 4. Accéder à l'application

| Service | URL |
|---|---|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ API Backend | http://localhost:8000/api/v1/ |
| 📖 Swagger UI | http://localhost:8000/api/schema/swagger-ui/ |
| 🗄️ Admin Django | http://localhost:8000/admin/ |

### Commandes utiles

```bash
# Voir les logs du backend
docker-compose logs -f pharma_backend

# Exécuter des commandes Django
docker exec -it pharmamanager-pharma_backend-1 python manage.py <commande>

# Créer un superutilisateur
docker exec -it pharmamanager-pharma_backend-1 python manage.py createsuperuser

# Re-seeder les données
docker exec -it pharmamanager-pharma_backend-1 python manage.py seed

# Arrêter les conteneurs
docker-compose down

# Arrêter et supprimer les données (⚠️ efface la base de données)
docker-compose down -v
```

---

## 🛠️ Installation Manuelle (Sans Docker)

### Backend

```bash
cd pharma-backend

# Créer et activer l'environnement virtuel
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Linux / macOS

# Installer les dépendances
pip install -r requirements.txt

# Configurer l'environnement
cp .env.exemple .env         # Modifier les valeurs selon votre config

# Appliquer les migrations
python manage.py migrate

# Seeder les données de test
python manage.py seed

# Lancer le serveur
python manage.py runserver
```

### Frontend

```bash
cd pharma-front-end
npm install
npm run dev
```

> **Note**: En mode développement sans Docker, le frontend tourne sur http://localhost:5173 et appelle l'API sur http://localhost:8000. Assurez-vous que `VITE_API_URL=http://localhost:8000/api/v1` est défini dans votre `.env` frontend.

---

## Variables d'Environnement

### Backend (`pharma-backend/.env`)

```env
DEBUG=True
SECRET_KEY=votre-secret-key-tres-securisee

# Base de données PostgreSQL
POSTGRES_DB=pharma_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
DB_HOST=localhost          # 'pharma_db' si Docker
DB_PORT=5432
```

### Frontend (`pharma-front-end/.env`) — optionnel

```env
# Laisser vide pour utiliser le proxy Nginx en Docker
# Définir uniquement en développement local sans Docker
VITE_API_URL=http://localhost:8000/api/v1
```

---

## Documentation API

Swagger UI : http://localhost:8000/api/schema/swagger-ui/

### Endpoints principaux

| Méthode | Endpoint | Description |
|---|---|---|
| GET | `/api/v1/medicaments/` | Liste des médicaments |
| POST | `/api/v1/medicaments/` | Créer un médicament |
| GET | `/api/v1/medicaments/alertes/` | Médicaments en stock bas |
| GET | `/api/v1/categories/` | Liste des catégories |
| GET | `/api/v1/ventes/` | Liste des ventes |
| POST | `/api/v1/ventes/` | Créer une vente |
