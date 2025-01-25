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
Nouvelle fonctionnalité : feature/nom-feature
Correction de bug : fix/nom-bug
Documentation : docs/sujet
Refactoring : refactor/sujet

3. Messages de Commit
```bash
Format : <type>(<scope>): <description>
```
Exemples :
feat(onboarding): implement login page
fix(auth): resolve validation error
style(ui): update button design
docs(readme): add deployment guide

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
