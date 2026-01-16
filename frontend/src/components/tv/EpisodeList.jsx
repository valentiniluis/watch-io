import ErrorSection from "../UI/ErrorSection";
import EpisodeCard from './EpisodeCard';
import HorizontalScrollContainer from "../layout/HorizontalScrollContainer";

export default function EpisodeList({ episodes }) {
  if (!episodes?.length) return <ErrorSection message="No episodes available!" />

  return (
    <HorizontalScrollContainer.wrapper>
      <HorizontalScrollContainer className="episode-list">
        {episodes.map(episode => <EpisodeCard key={episode.id} episode={episode} />)}
      </HorizontalScrollContainer>
    </HorizontalScrollContainer.wrapper>
  );
}