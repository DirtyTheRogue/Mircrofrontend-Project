import React, { useState, useEffect, Suspense, lazy } from 'react';
import './App.css';

// TODO: importer les 3 MFEs avec React.lazy()

function LoadingFallback({ name }) {
  return <div className="loading-fallback">Chargement {name}...</div>;
}

function App() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // TODO: ecouter les mises a jour du panier pour le badge
  }, []);

  return (
    <div className="shell">
      <header className="shell-header">
        <h1 className="logo">RetroShop</h1>
        <div className="cart-badge">Panier ({cartCount})</div>
      </header>
      <main className="shell-main">
        <section className="product-area">
          {/* TODO: afficher mfe-product avec Suspense */}
          <LoadingFallback name="Products" />
        </section>
        <aside className="cart-area">
          {/* TODO: afficher mfe-cart avec Suspense */}
          <LoadingFallback name="Cart" />
        </aside>
      </main>
      <section className="reco-area">
        {/* TODO: afficher mfe-reco avec Suspense */}
        <LoadingFallback name="Recommendations" />
      </section>
    </div>
  );
}

export default App;
