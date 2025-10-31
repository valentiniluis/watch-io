
export default function HighlightedText({ regularText, highlighted }) {
  return (
    <p className="small-text">
      {regularText}
      <span className="regular-text">
        {highlighted}
      </span>
    </p>
  );
}