export default function StarIcon({ className = 'w-5 h-5' }) {
  return (
    <svg
      className={className}
      xmlns="https://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.116 3.552.97 5.39c.198 1.109-.983 1.95-1.95 1.45L12 18.27l-4.757 2.505c-.966.5-2.148-.34-1.95-1.45l.97-5.39-4.116-3.552c-.887-.76-.415-2.212.749-2.305l5.404-.433L10.788 3.21z"
        clipRule="evenodd"
      />
    </svg>
  );
}
