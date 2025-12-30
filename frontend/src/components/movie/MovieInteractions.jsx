import { useQuery, useMutation } from "@tanstack/react-query";
import { addInteraction, getInteractions, removeInteraction } from "../../util/movie-query";
import ToggleInteraction from './ToggleInteraction';
import queryClient from '../../util/query';
import Spinner from "../UI/Spinner";
import { useDispatch, useSelector } from "react-redux";
import { interactionTypes } from "../../util/constants";
import { toastActions } from '../../store/toast';
import ErrorSection from "../UI/ErrorSection";

export default function MovieInteractions() {
  const { data: media, type: mediaType } = useSelector(state => state.media);
  const dispatch = useDispatch();
  const { id: mediaId } = media;

  const queryKey = ['interaction', { mediaId, mediaType }];

  const { data, isPending, isError } = useQuery({
    queryKey,
    queryFn: getInteractions
  });

  const { mutate: add } = useMutation({
    mutationFn: addInteraction,
    onSuccess: async (ctx) => {
      console.log(ctx);
      const { message } = ctx;
      dispatch(toastActions.setSuccessToast(message || "Interaction added successfully!"));
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (ctx) => dispatch(toastActions.setErrorToast(`Failed to add interaction: ${ctx?.response?.data?.message || ctx.message}`))
  });

  const { mutate: remove } = useMutation({
    mutationFn: removeInteraction,
    onSuccess: async ({ message }) => {
      dispatch(toastActions.setSuccessToast(message || "Interaction removed successfully!"));
      await queryClient.invalidateQueries({ queryKey: ['interaction', { mediaId }] });
    },
    onError: (ctx) => dispatch(toastActions.setErrorToast(`Failed to remove interaction: ${ctx?.response?.data?.message || ctx.message}`))
  });

  function handleAddInteraction(type) {
    add({ type, mediaId, mediaType });
  }

  function handleRemoveInteraction() {
    remove({ type: data?.type, mediaId });
  }

  let content;
  if (isPending) {
    content = <Spinner />
  }
  else if (isError) {
    content = <ErrorSection message="Failed to load interactions." />
  }
  else if (data?.hasInteraction) {
    content = <ToggleInteraction active={true} type={data.type} onClick={handleRemoveInteraction} />
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