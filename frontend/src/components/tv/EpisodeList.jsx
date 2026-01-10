import ErrorSection from "../UI/ErrorSection";
import EpisodeCard from './EpisodeCard';

export default function EpisodeList({ episodes }) {

  if (!episodes.length) return <ErrorSection message="No episodes available!" />

  return (
    <div id="episodes-container">
      {episodes.map(episode => <EpisodeCard episode={episode} />)}
    </div>
  );
}