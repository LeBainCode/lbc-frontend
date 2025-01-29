# Plateforme d'Exercices de Programmation - Frontend

## 🚀 Quick Start

```bash
git clone [repository-url]
cd [project-name]
npm install

npm run dev
```

## 🛠 Stack Technique
Framework: Next.js 14
Language: TypeScript
Styling: Tailwind CSS
Déploiement: Vercel
State Management: Zustand
Testing: Jest & React Testing Library

# 📝 Guide de Développement
Git Workflow
1. Création de Branches
```bash
# Toujours partir d'une branche main à jour
git checkout main
git pull origin main
git checkout -b feature/nom-feature
```
2. Convention de Nommage des Branches
- Nouvelle fonctionnalité : feature/nom-feature
- Correction de bug : fix/nom-bug
- Documentation : docs/sujet
- Refactoring : refactor/sujet
etc. 

3. Messages de Commit
```bash
Format : be descriptive 
```
Exemples :
- loading state added to sign in 
- footer color modified + subscription button added (not func)

## 🔐 Authentication with GitHub

### Development Setup
1. Get the GitHub OAuth credentials from the project maintainer:
   - `GITHUB_CLIENT_ID`
   - `GITHUB_CLIENT_SECRET`
   
   Note: You don't need to create a new GitHub OAuth app - we use the project's existing one.

### Local Development
1. Start the backend server on port 5000
2. Start the frontend:
```bash
npm run dev
```
1. Visit http://localhost:3000
2. Click "Sign in with GitHub"
3. Authorize the application

Authentication Flow
User clicks "Sign in with GitHub"
GitHub OAuth redirects to backend
Backend creates/updates user and generates JWT
User is redirected to dashboard with token
Frontend stores token and fetches user data

Note: Ensure both frontend and backend are running for authentication to work.

# 📁 Structure du Projet
Le frontend dev ajouteras 

## 🔧 Scripts Disponibles
```bash
npm run dev      # Mode développement
npm run build    # Build production
npm run start    # Démarrer en production
npm run lint     # Linter
npm run test     # Tests
```

## 🌍 Configuration Environnement

to be completed by the frontend dev

# To Note 
 view progress : https://lebaincodefront-d2j7aye5k-jayzhehs-projects.vercel.app/ 
