// src/components/product/CategoryCard.jsx
import { Link } from 'react-router-dom';
import PlaceholderImage from '../common/PlaceholderImage';

export default function CategoryCard({ category }) {
  return (
    <Link
      to={`/category/${category.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden rounded-sm"
    >
      {category.image_url ? (
        <img
          src={category.image_url}
          alt={category.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <PlaceholderImage seed={category.slug} className="w-full h-full" label={category.name} />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-brown/70 via-brown/10 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4">
        <h3 className="text-cream font-display text-lg md:text-xl">{category.name}</h3>
      </div>
    </Link>
  );
}
