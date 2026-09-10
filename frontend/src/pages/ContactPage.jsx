// src/pages/ContactPage.jsx
import { useState } from 'react';
import { FiMapPin, FiPhone, FiMail, FiMessageCircle } from 'react-icons/fi';
import { contactService } from '../services/contactService';
import { useToast } from '../context/ToastContext';
import Button from '../components/common/Button';
import ZariDivider from '../components/common/ZariDivider';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const handleChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await contactService.submit(form);
      showToast('Message sent! We will get back to you soon.', 'success');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="font-display text-3xl md:text-4xl text-maroon">Contact Us</h1>
        <p className="text-brown-light mt-3">We'd love to hear from you — questions, feedback, or just to say hello.</p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-10">
        {/* Contact info */}
        <div className="flex flex-col gap-6">
          <InfoCard icon={FiMapPin} title="Visit Our Store" lines={['14 Heritage Lane, Bandra West', 'Mumbai, Maharashtra 400050']} />
          <InfoCard icon={FiPhone} title="Call Us" lines={['+91 98765 43210', 'Mon – Sat, 10 AM – 7 PM IST']} />
          <InfoCard icon={FiMail} title="Email Us" lines={['care@houseofjaee.com']} />

          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-sm text-sm font-medium hover:bg-green-700 transition-colors"
          >
            <FiMessageCircle size={18} /> Chat with us on WhatsApp
          </a>

          {/* Map placeholder */}
          <div className="bg-beige border border-beige-dark rounded-sm h-48 flex items-center justify-center">
            <p className="text-brown-light text-sm">📍 Map placeholder — embed Google Maps here</p>
          </div>
        </div>

        {/* Contact form */}
        <div className="bg-white border border-beige-dark rounded-sm p-6 md:p-8">
          <h2 className="font-display text-xl text-brown mb-5">Send Us a Message</h2>
          <ZariDivider className="mb-6" />
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brown mb-1.5">Name</label>
                <input type="text" required value={form.name} onChange={handleChange('name')} className="input-field" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-brown mb-1.5">Email</label>
                <input type="email" required value={form.email} onChange={handleChange('email')} className="input-field" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">Phone (Optional)</label>
              <input type="tel" value={form.phone} onChange={handleChange('phone')} className="input-field" placeholder="10-digit mobile number" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">Subject</label>
              <input type="text" value={form.subject} onChange={handleChange('subject')} className="input-field" placeholder="What is this about?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown mb-1.5">Message</label>
              <textarea required rows={5} value={form.message} onChange={handleChange('message')} className="input-field resize-none" placeholder="Tell us how we can help..." />
            </div>
            <Button type="submit" size="lg" disabled={submitting} className="mt-2">
              {submitting ? 'Sending...' : 'Send Message'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ icon: Icon, title, lines }) {
  return (
    <div className="bg-white border border-beige-dark rounded-sm p-5 flex gap-4">
      <div className="w-11 h-11 rounded-full bg-maroon/10 flex items-center justify-center shrink-0">
        <Icon size={20} className="text-maroon" />
      </div>
      <div>
        <h3 className="font-display text-base text-brown mb-1">{title}</h3>
        {lines.map((line) => (
          <p key={line} className="text-sm text-brown-light">{line}</p>
        ))}
      </div>
    </div>
  );
}
