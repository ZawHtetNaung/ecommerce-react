import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CIcon from '@coreui/icons-react';
import { cilCart, cilHeart } from '@coreui/icons';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { isProductInStock } from '../utils/productStock';
import { formatCurrency } from '../utils/price';

export default function StoreProductCard({ product }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart, addToFavorites, removeFromFavorites, isFavorite } = useStore();
  const [busyAction, setBusyAction] = useState('');
  const [message, setMessage] = useState('');
  const favorite = isFavorite(product.id);
  const hasDiscount = Number(product.discount_price || 0) > 0;
  const savingPercent = hasDiscount && Number(product.price || 0) > 0
    ? Math.max(1, Math.round(((Number(product.price) - Number(product.discount_price)) / Number(product.price)) * 100))
    : 0;
  const inStock = isProductInStock(product);

  async function runStoreAction(action, callback) {
    if (action === 'favorite' && !isAuthenticated) {
      navigate('/login', { state: { from: `${location.pathname}${location.search}` } });
      return;
    }

    setBusyAction(action);
    setMessage('');
    try {
      await callback();
      setMessage(action === 'cart' ? 'Added to cart' : favorite ? 'Removed' : 'Saved');
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || 'Please try again.');
    } finally {
      setBusyAction('');
    }
  }

  return (
    <article className="store-product-card">
      <Link to={`/product/${product.slug}`} className="store-product-media">
        {product.image_url ? <img src={product.image_url} alt={product.name} /> : <span>{product.name?.charAt(0)}</span>}
        {hasDiscount && <span className="product-sale-badge">Save {savingPercent}%</span>}
      </Link>
      <div className="store-product-copy">
        <span className="store-product-brand">{product.brand?.name || product.category?.name || 'MessaraLiving'}</span>
        <Link to={`/product/${product.slug}`}><h3>{product.name}</h3></Link>
        <div className="store-product-price">
          {hasDiscount && <small>{formatCurrency(product.price)}</small>}
          <strong className={hasDiscount ? 'is-sale' : ''}>{formatCurrency(product.discount_price || product.price)}</strong>
        </div>
        <div className="store-product-actions">
          <button
            type="button"
            className={favorite ? 'is-active' : ''}
            disabled={busyAction === 'favorite'}
            onClick={() => runStoreAction('favorite', () => favorite ? removeFromFavorites(product.id) : addToFavorites(product.id))}
            aria-label={favorite ? 'Remove from favourites' : 'Add to favourites'}
          >
            <CIcon icon={cilHeart} />
          </button>
          <button
            type="button"
            className="store-add-cart"
            disabled={busyAction === 'cart' || !inStock}
            onClick={() => runStoreAction('cart', () => addToCart(product))}
          >
            <CIcon icon={cilCart} />
            <span>{inStock ? 'Add to cart' : 'Out of stock'}</span>
          </button>
        </div>
        {message && <span className="store-card-message">{message}</span>}
      </div>
    </article>
  );
}
