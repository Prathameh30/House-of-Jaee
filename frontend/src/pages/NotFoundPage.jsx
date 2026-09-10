// src/pages/NotFoundPage.jsx
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <h1 className="font-display text-5xl text-maroon mb-4">404</h1>
      <p className="text-brown-light mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/"><Button size="lg">Back to Homepage</Button></Link>
    </div>
  );
}
