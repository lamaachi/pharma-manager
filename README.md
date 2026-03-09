# PharmaManager

Application de gestion de pharmacie — Développé dans le cadre du test technique SMARTHOLOL

## Stack Technique
- Backend : Django 4.x + Django REST Framework + PostgreSQL
- Frontend : React.js (Vite)
- Documentation API : Swagger (drf-spectacular)

## Installation Backend
```bash
cd pharma-backend
python -m venv venv && source venv/bin/activate
# ou sous Windows : venv\Scripts\activate
pip install -r requirements.txt
cp .env.exemple .env # Configurer les variables (PostgreSQL, etc.)
python manage.py migrate
python manage.py loaddata fixtures/initial_data.json # Données de test (à créer)
python manage.py runserver
```

## Variables d'Environnement (.env)
```
DEBUG=True
SECRET_KEY=votre-secret-key
DB_NAME=pharma_db
DB_USER=postgres
DB_PASSWORD=password
DB_HOST=localhost
DB_PORT=5432
```

## Installation Frontend
```bash
cd pharma-front-end
npm install
cp .env.example .env
npm run dev
```

## Documentation API
Swagger UI disponible sur : http://localhost:8000/api/schema/swagger-ui/
