export default function Card({ children, className = "", ...props }) {
  return (
    <div
      className={`rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
