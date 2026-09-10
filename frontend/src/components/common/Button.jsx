// src/components/common/Button.jsx
const VARIANTS = {
  primary: 'bg-maroon text-cream hover:bg-maroon-dark border border-maroon',
  gold: 'bg-gold text-brown hover:bg-gold-light border border-gold',
  outline: 'bg-transparent text-maroon border border-maroon hover:bg-maroon hover:text-cream',
  ghost: 'bg-transparent text-brown hover:bg-beige border border-transparent',
  danger: 'bg-red-700 text-white hover:bg-red-800 border border-red-700',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-6 py-2.5 text-sm',
  lg: 'px-8 py-3.5 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled,
  type = 'button',
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-sm font-body font-medium tracking-wide
        transition-colors duration-200 uppercase text-xs md:text-sm
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
