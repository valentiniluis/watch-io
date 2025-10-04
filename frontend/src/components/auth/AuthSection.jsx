import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import Toast from '../UI/Toast.jsx';
import { useMutation } from '@tanstack/react-query';
import { authUser } from '../../util/user-query.js';
import queryClient from '../../util/query.js';


export default function Auth() {
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
      <section className="flex flex-col justify-center items-center gap-6 py-[4vh]">
        <h2 className="login-text">For a Customized Experience, Log In!</h2>
        <div className="flex gap-6">
          <GoogleLogin onSuccess={handleLogin} onError={handleAuthError} locale='en-US' />
        </div>
      </section>
    </>
  );
}