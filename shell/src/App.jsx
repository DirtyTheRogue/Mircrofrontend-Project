import React, { useEffect, useState, Suspense, lazy } from 'react';
import './App.css';
import eventBus from 'shared/eventBus';

function createRemoteComponent(importer, label) {
  return lazy(() =>
    importer().catch(() => ({
      default: function RemoteUnavailable() {
        return (
          <div
            style={{
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 0, 85, 0.08)',
              color: '#ffd5de',
              fontWeight: 600,
              lineHeight: 1.5,
            }}
          >
            MFE indisponible: {label}
          </div>
        );
      },
    }))
  );
}

const ProductGrid = createRemoteComponent(() => import('mfeProduct/ProductGrid'), 'Catalogue');
const Cart = createRemoteComponent(() => import('mfeCart/Cart'), 'Panier');
const Reco = createRemoteComponent(() => import('mfeReco/Reco'), 'Recommandations');

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('[Shell] Remote error:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            background: 'rgba(255, 0, 85, 0.08)',
            color: '#ffd5de',
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          MFE indisponible
        </div>
      );
    }

    return this.props.children;
  }
}

function LoadingFallback({ name }) {
  return <div className="loading-fallback">Chargement {name}...</div>;
}

function App() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const unsubscribe = eventBus.on('cart:updated', (payload) => {
      setCartCount(typeof payload?.count === 'number' ? payload.count : 0);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="shell">
      <header className="shell-header">
        <h1 className="logo">RetroShop</h1>
        <div className="cart-badge">Panier ({cartCount})</div>
      </header>
      <main className="shell-main">
        <section className="product-area">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback name="Products" />}>
              <ProductGrid />
            </Suspense>
          </ErrorBoundary>
        </section>
        <aside className="cart-area">
          <ErrorBoundary>
            <Suspense fallback={<LoadingFallback name="Cart" />}>
              <Cart />
            </Suspense>
          </ErrorBoundary>
        </aside>
      </main>
      <section className="reco-area">
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback name="Recommendations" />}>
            <Reco />
          </Suspense>
        </ErrorBoundary>
      </section>
    </div>
  );
}

export default App;
