// src/pages/HomePage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiTruck, FiShield, FiHeart, FiArrowRight } from "react-icons/fi";
import { productService } from "../services/productService";
import { categoryService } from "../services/categoryService";
import ProductGrid from "../components/product/ProductGrid";
import CategoryCard from "../components/product/CategoryCard";
import SectionHeading from "../components/common/SectionHeading";
import ZariDivider from "../components/common/ZariDivider";
import Button from "../components/common/Button";

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [featuredRes, catRes] = await Promise.all([
          productService.getAll({ limit: 8 }),
          categoryService.getAll(),
        ]);
        setFeatured(featuredRes.data.products);
        setCategories(catRes.data.categories);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* ---- Hero Banner ---- */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cream via-beige to-beige-dark">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-10 items-center relative z-10">
          <div>
            <span className="text-gold uppercase text-xs md:text-sm tracking-[0.3em] font-semibold">
              Festive Collection 2026
            </span>
            <h1 className="font-display text-4xl md:text-6xl text-maroon mt-4 leading-tight">
              Drape Yourself <br /> in Tradition
            </h1>
            <p className="mt-5 text-brown-light max-w-md font-body text-base md:text-lg">
              Handpicked silk, Banarasi, and Kanjivaram sarees — woven with
              heritage, styled for today.
            </p>
            <div className="mt-8 flex gap-4">
              <Link to="/shop">
                <Button size="lg">Shop Now</Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <img
              src="/images/hero/house-of-jaee.jpg"
              alt="House of Jaee"
              className="w-full rounded-sm shadow-xl"
            />
          </div>
        </div>
      </section>

      <ZariDivider />

      {/* ---- Featured Sarees ---- */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <SectionHeading
          eyebrow="Curated For You"
          title="Featured Sarees"
          subtitle="A handpicked edit of our most-loved drapes this season."
        />
        <ProductGrid products={featured} loading={loading} />
        <div className="text-center mt-10">
          <Link to="/shop">
            <Button variant="outline">
              View All Sarees <FiArrowRight />
            </Button>
          </Link>
        </div>
      </section>

      {/* ---- Shop by Category ---- */}
      <section className="bg-beige/40 py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <SectionHeading
            eyebrow="Explore"
            title="Shop by Category"
            subtitle="From everyday cottons to bridal silks, find the perfect saree for every occasion."
          />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {categories.slice(0, 8).map((cat) => (
              <CategoryCard key={cat.category_id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      <ZariDivider />

      {/* ---- Why Choose House of Jaee ---- */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-16">
        <SectionHeading
          eyebrow="Our Promise"
          title="Why Choose House of Jaee"
        />
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: FiHeart,
              title: "Handpicked Craftsmanship",
              desc: "Every saree is sourced directly from skilled weavers who carry forward generations of tradition.",
            },
            {
              icon: FiShield,
              title: "Quality You Can Trust",
              desc: "Each piece is quality-checked for fabric, finish, and zari work before it reaches you.",
            },
            {
              icon: FiTruck,
              title: "Doorstep Delivery",
              desc: "Carefully packaged and delivered across India, with cash on delivery available.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="text-center px-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-maroon/10 flex items-center justify-center mb-4">
                <Icon size={26} className="text-maroon" />
              </div>
              <h3 className="font-display text-lg text-brown mb-2">{title}</h3>
              <p className="text-sm text-brown-light">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
