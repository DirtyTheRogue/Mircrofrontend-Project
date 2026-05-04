# Contrat d'événements RetroShop

Document de référence pour la communication inter-MFE.


## Équipe

| Développeur | MFE | Port |
|---|---|---|
| Nikola | shell | 3000 |
| Adam | mfe-product | 3001 |
| Charles | mfe-cart | 3002 |
| Steven | mfe-reco | 3003 |

---

## Bus

`shared/eventBus.js` — singleton attaché à `window.__EVENT_BUS__`.

API :
- `eventBus.emit(event, data)` : émettre un événement
- `eventBus.on(event, callback)` : s'abonner, retourne une fonction de désabonnement
- `eventBus.off(event, callback)` : se désabonner manuellement
- `eventBus.once(event, callback)` : s'abonner une seule fois

Import dans chaque MFE via l'alias webpack `'shared'` (configuré dans les 4 webpack.config.js) :

```js
import eventBus from 'shared/eventBus';
```

---

## Modèle de données

Produit (depuis `shared/products.js`) :
```js
{ id: number, name: string, price: number, image: string, category: string }
```

Item du panier (interne à mfe-cart, non exposé) :
```js
{ cartId: string, id: number, name: string, price: number }
```

Décisions clés :
- Pas de quantité. Ajouter 2x le même produit = 2 lignes distinctes dans le panier.
- `cartId` est généré par mfe-cart à chaque ajout, unique par ligne (`Date.now() + random`).
- mfe-cart est la seule source de vérité de l'état du panier. Aucun autre MFE ne maintient de copie persistante.

---

## Événements

### `cart:add`

| Champ | Valeur |
|---|---|
| Émetteur | mfe-product (Adam) |
| Écouteur | mfe-cart (Charles) |
| Payload | `{ id: number, name: string, price: number }` |
| Sémantique | Ajoute une ligne au panier avec un nouveau cartId. |

Exemple d'émission (côté mfe-product) :
```js
eventBus.emit('cart:add', { id: 1, name: 'Manette SNES', price: 29 });
```

### `cart:updated`

| Champ | Valeur |
|---|---|
| Émetteur | mfe-cart (Charles) |
| Écouteurs | shell (Nikola, badge header), mfe-reco (Steven, filtrage recos) |
| Payload | `{ items: Array<{cartId, id, name, price}>, total: number, count: number }` |
| Sémantique | État complet du panier après chaque modification. Émis aussi au mount initial avec `items=[]`. |

Invariants garantis :
- `count === items.length`
- `total === Σ items[].price`

Exemple de payload reçu :
```js
{
  items: [
    { cartId: '1730xxxx-a3f2', id: 1, name: 'Manette SNES', price: 29 },
    { cartId: '1730xxxx-b9k1', id: 3, name: 'Game Boy Color', price: 89 }
  ],
  total: 118,
  count: 2
}
```

---

## Pas d'événement `cart:clear`

Le bouton "Vider le panier" est interne à mfe-cart. Le clear est propagé via `cart:updated` avec `items=[]`. Aucun autre MFE ne peut/n'a besoin de demander un reset du panier.

---

## Règles d'or

1. mfe-cart est seule source de vérité. Personne d'autre ne stocke d'état panier persistant.
2. Tout `eventBus.on()` dans un useEffect retourne sa fonction de désabonnement dans le return du useEffect (cleanup propre, anti-StrictMode).
3. `id` est un `number` (pas string). Pas de comparaisons `===` foireuses entre types.
4. Respect strict des noms d'événements et payloads. Un typo = silence radio (cf. consigne prof).

---

## Récap par MFE

### shell (port 3000) — Nikola
- Écoute : `cart:updated` → met à jour le badge avec `payload.count`
- N'émet rien
- Responsabilités spécifiques : configurer les remotes, imports lazy, Suspense, ErrorBoundary, lazy().catch() pour résilience

### mfe-product (port 3001) — Adam
- Émet : `cart:add` avec `{id, name, price}` au clic sur "Ajouter"
- N'écoute rien

### mfe-cart (port 3002) — Charles
- Écoute : `cart:add` → ajoute un item avec cartId unique
- Émet : `cart:updated` à chaque changement de state (incluant mount initial vide)
- Source de vérité unique du panier

### mfe-reco (port 3003) — Steven
- Écoute : `cart:updated` → adapte les recos selon `payload.items`
- N'émet rien
- Logique suggérée : filtrer PRODUCTS par catégories des items du panier, exclure les items déjà présents, fallback sur recos populaires si panier vide

---

## Phase d'assemblage

Nikola (shell) lance les 4 services dans 4 terminaux :
```bash
cd mfe-product && npm install && npm start  # T1, port 3001
cd mfe-cart    && npm install && npm start  # T2, port 3002
cd mfe-reco    && npm install && npm start  # T3, port 3003
cd shell       && npm install && npm start  # T4, port 3000
```

Ouvrir `http://localhost:3000` .

## Validation finale 

- [ ] Les 4 services démarrent sans erreur
- [ ] Cliquer "Ajouter" dans le catalogue ajoute l'article au panier
- [ ] Le badge du header affiche le bon nombre
- [ ] Les recommandations changent selon le contenu du panier
- [ ] Vider le panier remet tout à zéro
- [ ] Tuer mfe-reco (Ctrl+C) ne casse pas le reste de la page
