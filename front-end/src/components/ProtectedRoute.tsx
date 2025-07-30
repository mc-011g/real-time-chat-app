import { useContext, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || (user && !user.emailVerified)) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  return children;
}
