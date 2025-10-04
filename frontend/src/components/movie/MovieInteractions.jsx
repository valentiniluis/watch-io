import { useQuery, useMutation } from "@tanstack/react-query";
import { addInteraction, getInteractions, removeInteraction } from "../../util/movie-query";
import ToggleInteraction from './ToggleInteraction';
import queryClient from '../../util/query';
import Spinner from "../UI/Spinner";


const interactionTypes = ['watchlist', 'like', 'not interested'];


export default function MovieInteractions({ movie, onError }) {
  const movieId = movie.id;

  const {
    data: interactionData,
    isPending: interactionDataPending,
    isError: interactionDataIsError
  } = useQuery({
    queryKey: ['watchlist', { movieId }],
    queryFn: getInteractions
  });

  const { mutate: add, error: addError, isError: isAddError } = useMutation({
    mutationFn: addInteraction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['watchlist', { movieId }] });
    }
  });

  const { mutate: remove, error: removeError, isError: isRemoveError } = useMutation({
    mutationFn: removeInteraction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['watchlist', { movieId }] });
    }
  });

  if (isAddError || isRemoveError) {
    const message = (isAddError) ? addError.message : removeError.message;
    onError(message || 'Failed to interact with movie');
  }

  function handleAddInteraction(type) {
    const movieData = { id: movieId, title: movie.title, poster_path: movie.poster_path, year: movie.year, tmdb_rating: movie.vote_average };
    add({ movie: movieData, type });
  }

  function handleRemoveInteraction() {
    remove({ type: interactionData?.type, movieId });
  }

  let content;
  if (interactionDataPending) content = <Spinner />;

  else if (interactionDataIsError) {
    onError('Failed to fetch your movie interactions');
    content = <p>Failed to get movie interactions...</p>;
  }

  else if (interactionData?.hasInteraction) {
    content = (
      <ToggleInteraction active={true} type={interactionData.type} onClick={handleRemoveInteraction} />
    );
  }

  else if (!interactionData?.hasInteraction) {
    content = (
      <>
        {interactionTypes.map(type => (
          <ToggleInteraction key={type} type={type} onClick={() => handleAddInteraction(type)} />
        ))}
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:gap-10 md:flex-row justify-center flex-wrap">
      {content}
    </div>
  );
}