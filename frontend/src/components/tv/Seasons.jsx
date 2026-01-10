import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import DropdownMenu from '../UI/DropdownMenu';
import { useSelector } from "react-redux";
import { getTvSeason } from "../../query/tv";
import Spinner from "../UI/Spinner";
import ErrorSection from "../UI/ErrorSection";
import EpisodeList from "./EpisodeList";


export default function TvShowSeasons({ numberOfSeasons }) {
  const showId = useSelector(state => state.media.data.id);
  const [seasonNumber, setSeasonNumber] = useState(1);

  const { data, isError, error, isPending } = useQuery({
    queryKey: ['season', { showId, seasonNumber }],
    queryFn: getTvSeason,
    enabled: !!showId
  });

  const seasonsArray = Array.from({ length: numberOfSeasons },
    (_, i) => ({ id: `S${i + 1}`, name: i + 1, 'data-season': i + 1 }));

  function handleUpdateSeason(event) {
    const { season } = event.currentTarget.dataset;
    if (!season || season > numberOfSeasons) return;
    setSeasonNumber(season);
  }

  let content;
  if (isPending) {
    content = <Spinner text="Loading TV Show season..." />
  }
  else if (isError) {
    content = <ErrorSection message={`Failed to load season: ${error.message}`} />
  }
  else if (data) {
    const { season } = data;
    const { episodes } = season;
    content = <EpisodeList episodes={episodes} />
  }

  const seasonText = 'Season ' + seasonNumber;

  return (
    <div id="season-container" className="mt-10">

      <h2 className="section-title">Seasons & Episodes</h2>

      <div className="flex justify-center">
        <DropdownMenu
          className="bg-blue-600 text-white font-semibold rounded-lg text-sm md:text-[.92rem] lg:text-base md:tracking-wide hover:bg-blue-700 focus:ring-blue-800"
          containerClass="max-w-40"
          label="Season"
          text={seasonText}
          onUpdate={handleUpdateSeason}
          options={seasonsArray}
          key={showId}
        />

      </div>
      {content}
    </div>
  )
}