import { Navigate, Outlet } from 'react-router-dom';
import { getUserRole } from '../services/jwtUtils.js';

 const ProtectedRoute = () => { 
   return (getUserRole() ? <Outlet /> : <Navigate to={'/login'}/>);
 };

export default ProtectedRoute;