// src/components/common/Footer.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiInstagram,
  FiFacebook,
  FiMail,
  FiPhone,
  FiMapPin,
  FiSend,
} from "react-icons/fi";
import { contactService } from "../../services/contactService";
import { useToast } from "../../context/ToastContext";
import ZariDivider from "./ZariDivider";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await contactService.subscribeNewsletter(email.trim());
      showToast("Thank you for subscribing!", "success");
      setEmail("");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-brown text-cream mt-16">
      <ZariDivider />
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div>
          <h3 className="font-display italic text-2xl text-gold mb-3">
            House of Jaee
          </h3>
          <p className="text-sm text-beige leading-relaxed">
            Handcrafted sarees rooted in tradition, styled for the modern woman.
            Every drape tells a story of artisans, heritage, and quiet elegance.
          </p>
          <div className="flex gap-4 mt-4">
            <a
              href="#"
              aria-label="Instagram"
              className="text-beige hover:text-gold transition-colors"
            >
              <FiInstagram size={18} />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="text-beige hover:text-gold transition-colors"
            >
              <FiFacebook size={18} />
            </a>
          </div>
        </div>

        {/* Quick links */}
        <div>
          <h4 className="text-gold uppercase text-xs tracking-widest mb-4 font-semibold">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm text-beige">
            <li>
              <Link to="/shop" className="hover:text-gold">
                Shop All
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-gold">
                About Us
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-gold">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="/order-tracking" className="hover:text-gold">
                Track Your Order
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-gold uppercase text-xs tracking-widest mb-4 font-semibold">
            Get in Touch
          </h4>
          <ul className="space-y-3 text-sm text-beige">
            <li className="flex items-start gap-2">
              <FiMapPin size={16} className="mt-0.5 text-gold shrink-0" />
              <span>Vasai Virar, Maharashtra</span>
            </li>
            <li className="flex items-center gap-2">
              <FiPhone size={16} className="text-gold shrink-0" />
              <span>+91 7822876646</span>
            </li>
            <li className="flex items-center gap-2">
              <FiMail size={16} className="text-gold shrink-0" />
              <span>care@houseofjaee.com</span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-gold uppercase text-xs tracking-widest mb-4 font-semibold">
            Stay Updated
          </h4>
          <p className="text-sm text-beige mb-3">
            Subscribe for early access to new collections and festive offers.
          </p>
          <form onSubmit={handleSubscribe} className="flex">
            <input
              type="email"
              required
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-3 py-2 text-sm text-brown bg-cream rounded-l-sm outline-none"
            />
            <button
              type="submit"
              disabled={submitting}
              aria-label="Subscribe"
              className="bg-gold px-3 rounded-r-sm text-brown hover:bg-gold-light transition-colors disabled:opacity-60"
            >
              <FiSend size={16} />
            </button>
          </form>
        </div>
      </div>

      <div className="border-t border-brown-light/30 py-4 text-center text-xs text-beige/80">
        © {new Date().getFullYear()} House of Jaee. All rights reserved. Crafted
        with care for the love of sarees.
      </div>
    </footer>
  );
}
