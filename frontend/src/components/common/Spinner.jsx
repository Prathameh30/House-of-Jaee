// src/components/common/Spinner.jsx
export default function Spinner({ size = 32, className = '' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`inline-block animate-spin rounded-full border-2 border-beige-dark border-t-maroon ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function FullPageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size={40} />
    </div>
  );
}
