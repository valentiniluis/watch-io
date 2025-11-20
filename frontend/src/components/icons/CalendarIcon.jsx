export default function CalendarIcon({ className = 'w-4 h-4' }) {
  return (
    <svg
      className={className}
      xmlns="https://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M5.75 3a.75.75 0 01.75.75v.25h6.5v-.25a.75.75 0 011.5 0v.25h.75a2 2 0 012 2v8.5a2 2 0 01-2 2H4.25a2 2 0 01-2-2V5.75a2 2 0 012-2h.75v-.25A.75.75 0 015.75 3zM4.25 5.5V16h11.5V5.5H4.25zM6 7.75A.75.75 0 016.75 7h6.5a.75.75 0 010 1.5h-6.5A.75.75 0 016 7.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}
