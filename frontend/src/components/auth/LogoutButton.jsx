import { useDispatch } from 'react-redux';
import { useMutation } from '@tanstack/react-query';
import queryClient from '../../query/client';
import api from '../../api/client';
import { authActions } from '../../store/auth';
import { toastActions } from '../../store/toast';
import LogoutIcon from '/logout.svg';


export default function LogoutButton() {
  const dispatch = useDispatch();

  const { mutate: handleLogout } = useMutation({
    mutationFn: logoutMutation,
    onSuccess: () => {
      dispatch(authActions.logout());
      dispatch(toastActions.setSuccessToast("Logged out successfully!"));
      queryClient.invalidateQueries();
    },
    onError: () => dispatch(toastActions.setErrorToast("Failed to logout!"))
  });

  return (
    <button className='bg-transparent px-3 py-1.5 rounded-md hover:bg-stone-400/20' onClick={handleLogout}>
      <img src={LogoutIcon} alt="Logout Button Icon" className='max-h-6' />
    </button>
  );
}


async function logoutMutation() {
  await api.post('/auth/logout');
}