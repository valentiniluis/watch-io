import { useQuery, useMutation } from "@tanstack/react-query";
import { addInteraction, getInteractions, removeInteraction } from "../../util/movie-query";
import ToggleInteraction from './ToggleInteraction';
import queryClient from '../../util/query';
import Spinner from "../UI/Spinner";
import { useSelector } from "react-redux";


const interactionTypes = ['watchlist', 'like', 'not interested'];


export default function MovieInteractions({ onError }) {
  const movie = useSelector(state => state.movie);
  const { id: movieId } = movie;

  const {
    data: interactionData,
    isPending: interactionDataPending,
    isError: interactionDataIsError
  } = useQuery({
    queryKey: ['interaction', { movieId }],
    queryFn: getInteractions
  });

  const { mutate: add, error: addError, isError: isAddError } = useMutation({
    mutationFn: addInteraction,
    onSuccess: async () => await queryClient.invalidateQueries({ queryKey: ['interaction', { movieId }] })
  });

  const { mutate: remove, error: removeError, isError: isRemoveError } = useMutation({
    mutationFn: removeInteraction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['interaction', { movieId }] });
    }
  });

  if (isAddError || isRemoveError) {
    const message = (isAddError) ? addError.message : removeError.message;
    onError(message || 'Failed to interact with movie');
  }

  function handleAddInteraction(type) {
    add({ movie, type });
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
  } else {
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