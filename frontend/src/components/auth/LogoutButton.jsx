import { useDispatch } from 'react-redux';
import LogoutIcon from '/logout.svg';
import queryClient from '../../util/query';
import api from '../../api/request';
import { authActions } from '../../store/auth';


export default function LogoutButton() {
  const dispatch = useDispatch();

  async function handleLogout() {
    await api.post('/auth/logout');
    dispatch(authActions.logout());
    await queryClient.invalidateQueries();
  }

  return (
    <button className='bg-transparent px-3 py-1.5 rounded-md hover:bg-stone-400/20' onClick={handleLogout}>
      <img src={LogoutIcon} alt="Logout Button Icon" className='max-h-6' />
    </button>
  );
}