// src/components/common/SectionHeading.jsx
export default function SectionHeading({ eyebrow, title, subtitle, align = 'center' }) {
  const alignClass = align === 'left' ? 'text-left items-start' : 'text-center items-center';
  return (
    <div className={`flex flex-col ${alignClass} mb-10`}>
      {eyebrow && (
        <span className="text-gold text-xs tracking-[0.25em] uppercase font-semibold mb-3">
          {eyebrow}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-display font-semibold text-maroon">{title}</h2>
      {subtitle && (
        <p className="mt-3 text-brown-light max-w-xl font-body">{subtitle}</p>
      )}
    </div>
  );
}
