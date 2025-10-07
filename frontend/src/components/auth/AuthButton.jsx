import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import Toast from '../UI/Toast.jsx';
import { useMutation } from '@tanstack/react-query';
import { authUser } from '../../util/user-query.js';
import queryClient from '../../util/query.js';


export default function AuthButton() {
  const [authFail, setAuthFail] = useState({ show: false, message: null });

  const { mutate } = useMutation({
    mutationFn: authUser,
    // invalidate all cached data once authetication succeeds (refetch everything)
    onSuccess: async () => await queryClient.invalidateQueries(),
    onError: () => setAuthFail({ show: true, message: "Failed to Authenticate" })
  });

  async function handleLogin(response) {
    mutate({ credentials: response });
  }

  function handleAuthError() {
    setAuthFail({ show: true, message: 'Google Authentication Failed.' });
  }

  return (
    <>
      {authFail.show && <Toast message={authFail.message} />}
      <section>
        <GoogleLogin onSuccess={handleLogin} onError={handleAuthError} locale='en-US' size='medium' theme='filled_blue' shape='pill' />
      </section>
    </>
  );
}