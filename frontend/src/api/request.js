import axios from "axios";
// import { authActions } from "../store/auth";
// import { toastActions } from "../store/toast";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_BASE,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});


// let isRefreshing = false;
// export const setupInterceptors = (store) => {
//   api.interceptors.response.use(
//     (response) => response,
//     async (error) => {
//       const { auth } = store.getState();
//       if (error.response.status === 401 && !isRefreshing) {
//         isRefreshing = true;
//         if (!auth.isLoggedIn) store.dispatch(toastActions.setInfoToast("Please log in for a better experience!"));
//         else {
//           store.dispatch(authActions.logout());
//           store.dispatch(toastActions.setErrorToast("Authentication error occurred, please log in again!"));
//           localStorage.removeItem("WATCHIO_JWT_EXPIRY");
//         }
//         isRefreshing = false;
//       }
//       return Promise.reject(error);
//     }
//   );
// };


export default api;