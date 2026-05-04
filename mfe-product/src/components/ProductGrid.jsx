import React from 'react';
import eventBus from 'shared/eventBus';
import PRODUCTS from 'shared/products';
import './ProductGrid.css';

function ProductCard({ product, onAdd }) {
  return (
    <div className="product-card">
      <div className="product-image" data-category={product.category}>
        {product.category}
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-price">{product.price} EUR</p>
      <button className="add-button" onClick={() => onAdd(product)}>
        Ajouter au panier
      </button>
    </div>
  );
}

function ProductGrid() {
  const handleAdd = (product) => {
    // TODO: notifier le reste de l'application qu'un produit a ete ajoute
  };

  return (
    <div className="product-grid">
      <h2>Catalogue</h2>
      <div className="grid">
        {PRODUCTS.map(p => (
          <ProductCard key={p.id} product={p} onAdd={handleAdd} />
        ))}
      </div>
    </div>
  );
}

export default ProductGrid;
