import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useDispatch } from 'react-redux';
import { authActions } from '../../store/auth';
import api from '../../api/request.js';


export default function Auth() {
  const dispatch = useDispatch();
  const [authFail, setAuthFail] = useState({ show: false, message: null });

  async function handleLogin(response) {
    try {
      const backend_base_url = import.meta.env.VITE_BACKEND_BASE;
      const { data } = await api.post(backend_base_url + '/auth/google', response);
      const { user } = data;
      dispatch(authActions.login(user));
    } catch {
      setAuthFail({ show: true, message: "Failed to Authenticate" });
    }
  }

  function handleAuthError() {
    setAuthFail({ show: true, message: 'Failed to authenticate with Google' });
  }

  return (
    <section className="flex flex-col justify-center items-center gap-6 py-[8vh]">
      {authFail.show && <p className='bg-red-200 text-red-950 w-75 rounded-sm text-center'>{authFail.message}</p>}
      <h2 className="login-text">For a Customized Experience, Log In!</h2>
      <div className="flex gap-6">
        <GoogleLogin onSuccess={handleLogin} onError={handleAuthError} locale='en-US' />
      </div>
    </section>
  );
}