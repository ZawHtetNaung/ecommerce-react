import { useParams } from 'react-router-dom';
import ProductForm from '../components/ProductForm';

export default function ProductEditPage() {
  const { productId } = useParams();
  return <ProductForm productId={productId} />;
}
