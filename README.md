# 🗂️ Mini Trello – Fullstack App

Application web de type Trello simplifié permettant de gérer des boards, colonnes et cartes avec drag & drop, authentification et persistance en base de données.

## ✨ Fonctionnalités

#### 🔐 Authentification

- Inscription (Signup)

- Connexion (Login)

- Déconnexion

- Protection des routes (accès au board uniquement si connecté)

#### 📋 Boards

- Renommage du board

#### 🧱 Colonnes

- Ajouter une colonne

- Renommer une colonne

- Supprimer une colonne

- Sauvegarde de l’ordre en base

#### 🗃️ Cartes

- Ajouter une carte

- Modifier le titre / description

- Supprimer une carte

- Drag & drop des cartes entre colonnes

- Sauvegarde des positions en base

## 🧑‍💻 Stack technique
#### Frontend

- React + TypeScript

- Apollo Client (GraphQL)

- React Router

- DnD Kit (drag & drop)

- CSS Modules

- Nginx (production)

#### Backend

- NestJS

- Prisma ORM

- MySQL

- Docker

- GraphQL (Apollo Server)

## 📁 Structure du projet
```
.
├── backend/        # API NestJS + GraphQL + Prisma
├── frontend/       # React app
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🚀 Lancer le projet avec Docker
#### Prérequis

- Docker

#### Démarrage

- À la racine du projet :

```docker compose up --build```

#### Accès

- Frontend : ```http://localhost:3000```

- Backend (GraphQL) : ```http://localhost:3001/graphql```

- MySQL : ```localhost:3306```

## 🗄️ Base de données

Les migrations Prisma sont appliquées automatiquement au démarrage

Le schéma est situé dans :

```backend/prisma/schema.prisma```

#### 🔐 Variables d’environnement (exemple)

```DATABASE_URL=mysql://trello:trello@mysql:3306/trello```


## 👨‍🎓 Auteur

Projet réalisé par ```Priyank Solanki```
Dans le cadre d’un projet fullstack React / NestJS / GraphQL.