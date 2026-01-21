import { useQuery, useMutation } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { addInteraction, getInteraction, removeInteraction } from "../../query/interaction";
import ToggleInteraction from './ToggleInteraction';
import queryClient from '../../query/client';
import Spinner from "../UI/Spinner";
import { interactionTypes } from "../../util/constants";
import { toastActions } from '../../store/toast';
import ErrorSection from "../UI/ErrorSection";

export default function MovieInteractions() {
  const media = useSelector(state => state.media);
  const dispatch = useDispatch();

  const mediaId = media.data.id;
  const mediaType = media.type;

  const queryKey = ['interaction', { mediaId, mediaType }];

  const { data, isPending, isError } = useQuery({
    queryKey,
    queryFn: getInteraction
  });

  const { mutate: add, isPending: isAddPending } = useMutation({
    mutationFn: addInteraction,
    onSuccess: async ({ message }) => {
      dispatch(toastActions.setSuccessToast(message || "Interaction added successfully!"));
      await queryClient.invalidateQueries({ queryKey });
    },
    onError: (ctx) => dispatch(toastActions.setErrorToast(`Failed to add interaction: ${ctx?.response?.data?.message || ctx.message}`))
  });

  const { mutate: remove, isPending: isRemovePending } = useMutation({
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
    remove({ mediaType, mediaId });
  }

  let content;
  if (isPending) {
    content = <Spinner />
  }
  else if (isError) {
    content = <ErrorSection message="Failed to load interactions." />
  }
  else if (data?.hasInteraction) {
    content = (
      <ToggleInteraction 
        active={true} 
        disabled={isRemovePending} 
        type={data.type} 
        onClick={handleRemoveInteraction} 
      />
    );
  } else {
    content = (
      <>
        {interactionTypes.map(type => (
          <ToggleInteraction 
            disabled={isAddPending} 
            key={type} 
            type={type} 
            onClick={() => handleAddInteraction(type)} 
          />
        ))}
      </>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 md:gap-10 md:flex-row justify-center flex-wrap mt-4">
      {content}
    </div>
  );
}