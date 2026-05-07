<!-- ────────────────────────────────────────────────────────────────────────────
     GUIDE D'INTÉGRATION — Tokens CSS & Sidebar Component
     ──────────────────────────────────────────────────────────────────────────── -->

# 🎨 Design System — Dark Premium

Guide complet d'utilisation des tokens CSS, du fichier global CSS, et du composant Sidebar.

---

## 📋 Table des matières

1. [Fichiers créés](#fichiers-créés)
2. [Architecture](#architecture)
3. [Variables CSS (Tokens)](#variables-css-tokens)
4. [Utilisation dans les composants](#utilisation-dans-les-composants)
5. [Composant Sidebar](#composant-sidebar)
6. [Intégration complète](#intégration-complète)
7. [Bonnes pratiques](#bonnes-pratiques)

---

## 📦 Fichiers créés

### 1. **`src/styles/tokens.css`**

Fichier des variables CSS natives (:root) contenant :

- 🎨 **Couleurs** : bg, surfaces, accents, statuts (vert, rouge, ambre, etc.)
- 📏 **Espacements** : space-1 à space-12, gaps
- 🔳 **Arrondis** : radius-sm à radius-2xl
- 🔤 **Typographie** : font-family, sizes, weights, line-heights
- ✨ **Effets** : shadows, transitions, opacités
- 📊 **Z-index** : couches de stacking
- 🔲 **Composants** : variables pour inputs, buttons, cards, sidebar

### 2. **`src/styles/global.css`**

Styles de base globaux :

- Reset CSS complet
- Styles pour `body`, `html`, headings, paragraphes
- Styles des formulaires (inputs, selects, textarea)
- Scrollbars personnalisées
- Tables, images, listes
- Typographie complète (avec var() du tokens.css)

### 3. **`src/components/Sidebar.jsx`**

Composant React réutilisable :

- ✅ Navigation avec sections dépliables
- ✅ Liens pour Inventory (Produits, Catégories)
- ✅ Liens pour Contacts (Fournisseurs)
- ✅ Mode replié/expansé
- ✅ État actif sur les items
- ✅ Effets hover avec bordures

### 4. **`src/components/Sidebar.module.css`**

Styles du composant Sidebar :

- Utilise **exclusivement** les variables du tokens.css
- Responsive (mobile, tablet, desktop)
- Accessibility (focus-visible, prefers-reduced-motion)

---

## 🏗️ Architecture

```
frontend/src/
├── styles/
│   ├── tokens.css          ← Variables CSS (source unique de vérité)
│   ├── global.css          ← Styles globaux basés sur tokens
│   └── app.css             ← Styles spécifiques de l'App
├── components/
│   ├── Sidebar.jsx         ← Composant Sidebar
│   ├── Sidebar.module.css  ← Styles du Sidebar
│   └── ... autres composants
└── App.jsx                 ← Point d'entrée
```

**Principe : Tokens CSS → Global CSS → Composants**

---

## 🎨 Variables CSS (Tokens)

### Couleurs

```css
/* Accents & Surfaces */
var(--color-bg)              /* #0A0B0F - Background principal */
var(--color-surface)         /* #111318 - Surfaces (cartes) */
var(--color-surface-hover)   /* #181B22 - Hover state */
var(--color-border)          /* #1E2230 - Bordures */
var(--color-accent)          /* #4F7FFF - Accent primaire (bleu) */

/* Statuts */
var(--color-green)           /* #22C55E - Succès */
var(--color-red)             /* #EF4444 - Erreur */
var(--color-amber)           /* #F59E0B - Avertissement */
var(--color-purple)          /* #A855F7 - Info */
var(--color-cyan)            /* #06B6D4 - Infos */

/* Texte */
var(--color-text)            /* #F1F5F9 - Texte principal */
var(--color-text-muted)      /* #64748B - Texte secondaire */
var(--color-text-dim)        /* #94A3B8 - Texte faible */
```

### Espacements

```css
/* Padding/Margin scale (4px base) */
var(--space-1)  /* 4px */
var(--space-2)  /* 8px */
var(--space-3)  /* 12px */
var(--space-4)  /* 16px */
var(--space-5)  /* 20px */  ← Utilisation courante
var(--space-6)  /* 24px */
```

### Arrondis

```css
var(--radius-sm)   /* 5px   - Badges, petits boutons */
var(--radius-md)   /* 8px   - Inputs, petites cartes */
var(--radius-lg)   /* 12px  - Cartes moyennes */
var(--radius-xl)   /* 14px  - Grandes cartes */
var(--radius-2xl)  /* 16px  - Cartes principales */
```

---

## 💻 Utilisation dans les composants

### ✅ BON - Utiliser les variables

```jsx
// Components/MyComponent.jsx
import styles from "./MyComponent.module.css";

export default function MyComponent() {
  return <div className={styles.container}>Contenu</div>;
}
```

```css
/* MyComponent.module.css */
@import "../styles/tokens.css";

.container {
  padding: var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  color: var(--color-text);
  transition: all var(--transition-fast);
}

.container:hover {
  border-color: var(--color-accent);
  background-color: var(--color-surface-hover);
}
```

### ❌ MAUVAIS - Hardcoder les valeurs

```jsx
// ❌ NE PAS FAIRE
return (
  <div
    style={{
      padding: "20px",
      background: "#111318",
      borderRadius: "16px",
      color: "#F1F5F9",
    }}
  >
    Mauvais ❌
  </div>
);
```

### ✅ INLINE STYLES (si nécessaire)

```jsx
// Si vous devez utiliser inline styles
<div
  style={{
    padding: "var(--space-5)",
    background: "var(--color-surface)",
    borderRadius: "var(--radius-lg)",
  }}
>
  Contenu
</div>
```

---

## 🎯 Composant Sidebar

### Import & Utilisation

```jsx
// App.jsx
import Sidebar from "./components/Sidebar";
import { useState } from "react";

function App() {
  const [activeItem, setActiveItem] = useState("products");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (itemId) => {
    console.log("Navigation vers:", itemId);
    setActiveItem(itemId);
    // Charger le contenu correspondant
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        activeItem={activeItem}
        onNavigate={handleNavigate}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main style={{ flex: 1, overflow: "auto" }}>
        {/* Contenu principal */}
      </main>
    </div>
  );
}

export default App;
```

### Props de Sidebar

| Prop         | Type     | Description                                                |
| ------------ | -------- | ---------------------------------------------------------- |
| `activeItem` | string   | ID de l'item actif ('products', 'categories', 'suppliers') |
| `onNavigate` | function | Callback(itemId) appelé au clic                            |
| `collapsed`  | boolean  | État replié/expansé (défaut: false)                        |
| `onToggle`   | function | Callback() pour basculer l'état                            |

### Structure de navigation

```
📦 Inventory
├── ◉ Produits (id: 'products')
└── ◈ Catégories (id: 'categories')

👥 Contacts
└── ◬ Fournisseurs (id: 'suppliers')
```

---

## 🔗 Intégration complète

### Étape 1 : Importer les styles dans `main.jsx`

```jsx
// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./styles/global.css"; // ← IMPORTANT

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
```

### Étape 2 : Mettre à jour `App.jsx`

```jsx
import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ProductsPage from "./pages/ProductsPage";
import CategoriesPage from "./pages/CategoriesPage";
import SuppliersPage from "./pages/SuppliersPage";

function App() {
  const [activeItem, setActiveItem] = useState("products");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderPage = () => {
    switch (activeItem) {
      case "products":
        return <ProductsPage />;
      case "categories":
        return <CategoriesPage />;
      case "suppliers":
        return <SuppliersPage />;
      default:
        return <ProductsPage />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar
        activeItem={activeItem}
        onNavigate={setActiveItem}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <main
        style={{
          flex: 1,
          overflow: "auto",
          padding: "var(--space-5)",
          background: "var(--color-bg)",
        }}
      >
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
```

### Étape 3 : Créer les pages

```jsx
// pages/ProductsPage.jsx
export default function ProductsPage() {
  return (
    <div>
      <h1>Produits</h1>
      <p>Liste des produits ici...</p>
    </div>
  );
}
```

---

## ✨ Bonnes pratiques

### 1️⃣ Toujours utiliser `var()` pour les couleurs

```css
/* ✅ BON */
background-color: var(--color-surface);
border: 1px solid var(--color-border);

/* ❌ MAUVAIS */
background-color: #111318;
border: 1px solid #1e2230;
```

### 2️⃣ Utiliser les espacements standards

```css
/* ✅ BON */
padding: var(--space-4);
margin: var(--space-3) var(--space-2);

/* ❌ MAUVAIS */
padding: 16px;
margin: 12px 8px;
```

### 3️⃣ Respecter les arrondis par contexte

```css
/* Petits éléments */
border-radius: var(--radius-sm); /* Badges, icônes */

/* Inputs et petites cartes */
border-radius: var(--radius-md); /* Inputs, dropdowns */

/* Cartes moyennes */
border-radius: var(--radius-lg); /* Modals petits */

/* Grandes cartes */
border-radius: var(--radius-2xl); /* Cartes principales */
```

### 4️⃣ Utiliser les transitions définies

```css
/* ✅ BON */
transition: all var(--transition-fast);
transition:
  background-color var(--transition-base),
  border-color var(--transition-fast);

/* ❌ MAUVAIS */
transition: all 0.2s ease-in-out;
transition: all 0.15s;
```

### 5️⃣ Maintenir la cohérence des hover states

```css
.button {
  background-color: var(--color-accent);
  border: 1px solid var(--color-accent);
  transition: all var(--transition-fast);
}

.button:hover {
  opacity: 0.9;
  border-color: var(--color-accent);
}

.button:active {
  transform: scale(0.95);
}
```

### 6️⃣ Grouper les styles de Sidebar

```css
/* Réutiliser les variables Sidebar */
--sidebar-width: 260px;
--sidebar-background: var(--color-bg);
--sidebar-item-padding: var(--space-3) var(--space-4);
```

---

## 🔧 Maintenance

### Modifier une couleur globalement

Pour changer la couleur accent dans **toute l'application** :

```css
/* tokens.css */
:root {
  --color-accent: #5b8fff; /* Ancien: #4F7FFF */
}
```

Tous les composants seront mises à jour automatiquement ✨

### Ajouter une nouvelle variable

```css
/* tokens.css - Ajouter dans la section appropriée */
--color-success-dark: #1ea853;
--spacing-custom: 7px;
```

Puis l'utiliser dans les composants :

```css
color: var(--color-success-dark);
padding: var(--spacing-custom);
```

---

## 📚 Ressources

- **Fichier tokens.css** : Liste complète de toutes les variables
- **global.css** : Reset et styles de base
- **Sidebar.module.css** : Exemple de composant utilisant les tokens

---

## ✅ Checklist d'intégration

- [ ] Importer `global.css` dans `main.jsx`
- [ ] Utiliser le composant `Sidebar` dans `App.jsx`
- [ ] Remplacer les styles hardcodés par des `var()`
- [ ] Tester les hover states
- [ ] Vérifier l'accessibilité (focus-visible)
- [ ] Tester le mode replié/expansé de Sidebar
- [ ] Valider sur mobile (responsive)

---

**🎉 Design System Ready !**

Tous les éléments sont maintenant centralisés, maintenables et cohérents.
