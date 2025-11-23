import { GoogleLogin } from '@react-oauth/google';
import { useMutation } from '@tanstack/react-query';
import { authUser } from '../../util/user-query.js';
import queryClient from '../../util/query.js';
import { useDispatch } from 'react-redux';
import { toastActions } from '../../store/toast.js';


export default function AuthButton() {
  const dispatch = useDispatch();

  const { mutate } = useMutation({
    mutationFn: authUser,
    // invalidate all cached data once authetication succeeds (refetch everything)
    onSuccess: async () => await queryClient.invalidateQueries(),
    onError: () => dispatch(toastActions.setToast({ message: "Failed to authenticate!", variant: "error" })),
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