import { Navigate, Outlet } from 'react-router-dom';
import { getUserRole } from '../services/jwtUtils';

 const ProtectedRoute = () => { 
   return (getUserRole() ? <Outlet /> : <Navigate to={'/login'}/>);
 };

export default ProtectedRoute;