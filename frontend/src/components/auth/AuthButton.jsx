import { GoogleLogin } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { authUser } from '../../query/user.js';
import queryClient from '../../query/client.js';
import { toastActions } from '../../store/toast.js';


export default function AuthButton() {
  const dispatch = useDispatch();

  const { mutate } = useMutation({
    mutationFn: authUser,
    // invalidate all cached data once authetication succeeds (refetch everything)
    onSuccess: async () => {
      await queryClient.invalidateQueries();
      dispatch(toastActions.setSuccessToast("Authenticated successfully!"));
    },
    onError: () => dispatch(toastActions.setErrorToast("Failed to authenticate!")),
  });

  async function handleLogin(response) {
    mutate({ credentials: response });
  }

  return (
    <section>
      <GoogleLogin onSuccess={handleLogin} locale='en-US' size='medium' theme='filled_blue' shape='pill' />
    </section>
  );
}