// src/pages/ShopPage.jsx
import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiFilter, FiX } from 'react-icons/fi';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import ProductGrid from '../components/product/ProductGrid';
import Button from '../components/common/Button';

const SORT_OPTIONS = [
  { value: 'created_at-DESC', label: 'Newest First' },
  { value: 'price-ASC', label: 'Price: Low to High' },
  { value: 'price-DESC', label: 'Price: High to Low' },
];

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeCategory = searchParams.get('category') || '';
  const activeSearch = searchParams.get('search') || '';
  const activeSort = searchParams.get('sort') || 'created_at-DESC';
  const activePage = Number(searchParams.get('page') || 1);
  const activeMinPrice = searchParams.get('minPrice') || '';
  const activeMaxPrice = searchParams.get('maxPrice') || '';
  const activeInStock = searchParams.get('inStock') === 'true';

  // Local input state for price fields — only pushed to the URL when "Apply" is clicked
  const [minPriceInput, setMinPriceInput] = useState(activeMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(activeMaxPrice);

  // Keep local inputs in sync if the URL changes some other way (e.g. "Clear all", chip removal)
  useEffect(() => {
    setMinPriceInput(activeMinPrice);
    setMaxPriceInput(activeMaxPrice);
  }, [activeMinPrice, activeMaxPrice]);

  useEffect(() => {
    categoryService.getAll().then((res) => setCategories(res.data.categories)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const [sortBy, sortOrder] = activeSort.split('-');
    try {
      const res = await productService.getAll({
        category: activeCategory || undefined,
        search: activeSearch || undefined,
        minPrice: activeMinPrice || undefined,
        maxPrice: activeMaxPrice || undefined,
        inStock: activeInStock || undefined,
        sortBy,
        sortOrder,
        page: activePage,
        limit: 12,
      });
      setProducts(res.data.products);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, activeSearch, activeSort, activePage, activeMinPrice, activeMaxPrice, activeInStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page'); // reset pagination only on filter change
    setSearchParams(next);
  };

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value); else next.delete(key);
    });
    next.delete('page');
    setSearchParams(next);
  };

  const applyPriceFilter = () => {
    updateParams({ minPrice: minPriceInput, maxPrice: maxPriceInput });
  };

  const clearPriceFilter = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    updateParams({ minPrice: '', maxPrice: '' });
  };

  const clearAllFilters = () => {
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams({});
  };

  const activeCategoryName = categories.find((c) => c.slug === activeCategory)?.name;

  const hasActiveFilters = activeCategory || activeSearch || activeMinPrice || activeMaxPrice || activeInStock;

  // Only show "Apply" as meaningful (e.g. disabled) if the inputs differ from what's currently applied
  const priceInputsDirty = minPriceInput !== activeMinPrice || maxPriceInput !== activeMaxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl md:text-4xl text-maroon">
          {activeSearch ? `Search results for "${activeSearch}"` : 'Shop All Sarees'}
        </h1>
        <p className="text-brown-light text-sm mt-2">{pagination.total} saree(s) found</p>
      </div>

      <button
        onClick={() => setMobileFiltersOpen((s) => !s)}
        className="lg:hidden flex items-center gap-2 text-sm text-maroon border border-maroon px-4 py-2 rounded-sm mb-4"
      >
        <FiFilter size={16} /> Filters
      </button>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {activeCategory && (
            <FilterChip label={`Category: ${activeCategoryName || activeCategory}`} onRemove={() => updateParam('category', '')} />
          )}
          {activeSearch && (
            <FilterChip label={`Search: "${activeSearch}"`} onRemove={() => updateParam('search', '')} />
          )}
          {(activeMinPrice || activeMaxPrice) && (
            <FilterChip
              label={`Price: ₹${activeMinPrice || '0'} - ₹${activeMaxPrice || 'Any'}`}
              onRemove={clearPriceFilter}
            />
          )}
          {activeInStock && (
            <FilterChip label="In Stock Only" onRemove={() => updateParam('inStock', '')} />
          )}
          <button onClick={clearAllFilters} className="text-xs text-maroon underline hover:no-underline ml-1">
            Clear all
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar filters */}
        <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block`}>
          <div className="bg-white border border-beige-dark rounded-sm p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h3 className="font-display text-lg text-brown">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)}><FiX size={18} /></button>
            </div>

            <h3 className="font-display text-base text-brown mb-3">Category</h3>
            <ul className="space-y-2 mb-6">
              <li>
                <button
                  onClick={() => updateParam('category', '')}
                  className={`text-sm ${!activeCategory ? 'text-maroon font-semibold' : 'text-brown-light hover:text-maroon'}`}
                >
                  All Categories
                </button>
              </li>
              {categories.map((cat) => (
                <li key={cat.category_id}>
                  <button
                    onClick={() => updateParam('category', cat.slug)}
                    className={`text-sm ${activeCategory === cat.slug ? 'text-maroon font-semibold' : 'text-brown-light hover:text-maroon'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>

            <h3 className="font-display text-base text-brown mb-3">Price Range</h3>
            <div className="flex items-center gap-2 mb-3">
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
                className="w-full border border-beige-dark rounded-sm px-2 py-1.5 text-sm outline-none"
              />
              <span className="text-brown-light text-sm">–</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyPriceFilter()}
                className="w-full border border-beige-dark rounded-sm px-2 py-1.5 text-sm outline-none"
              />
            </div>
            <Button
              size="sm"
              className="w-full mb-6"
              onClick={applyPriceFilter}
              disabled={!priceInputsDirty}
            >
              Apply
            </Button>

            <h3 className="font-display text-base text-brown mb-3">Availability</h3>
            <label className="flex items-center gap-2 text-sm text-brown mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={activeInStock}
                onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : '')}
                className="accent-maroon"
              />
              In Stock Only
            </label>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full"
                onClick={clearAllFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </aside>

        {/* Products */}
        <div>
          <div className="flex justify-end mb-5">
            <select
              value={activeSort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="border border-beige-dark rounded-sm px-3 py-2 text-sm bg-white outline-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <ProductGrid products={products} loading={loading} emptyMessage="No sarees match your filters. Try adjusting your search." />

          {!loading && products.length === 0 && hasActiveFilters && (
            <div className="text-center mt-4">
              <Button variant="outline" size="sm" onClick={clearAllFilters}>
                Clear filters and see all sarees
              </Button>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: pagination.totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => updateParam('page', String(i + 1))}
                  className={`w-9 h-9 rounded-sm text-sm border ${
                    activePage === i + 1
                      ? 'bg-maroon text-cream border-maroon'
                      : 'border-beige-dark text-brown hover:bg-beige'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 bg-beige border border-beige-dark text-brown text-xs px-3 py-1.5 rounded-full">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`} className="hover:text-maroon">
        <FiX size={12} />
      </button>
    </span>
  );
}