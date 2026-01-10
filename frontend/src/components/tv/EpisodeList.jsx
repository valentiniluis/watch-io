import ScrollContainer from "react-indiana-drag-scroll";
import ErrorSection from "../UI/ErrorSection";
import EpisodeCard from './EpisodeCard';

export default function EpisodeList({ episodes }) {
  if (!episodes?.length) return <ErrorSection message="No episodes available!" />

  return (
    <ScrollContainer className="episode-list">
      {episodes.map(episode => <EpisodeCard key={episode.id} episode={episode} />)}
    </ScrollContainer>
  );
}