
export default function HighlightedText({ regularText, highlighted }) {
  return (
    <p className="regular-text font-light">
      {regularText}
      <span className="hightlighted-text">
        {highlighted}
      </span>
    </p>
  );
}