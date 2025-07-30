import './App.css'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import ChatPage from './pages/ChatPage';
import NotFoundPage from './pages/NotFoundPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JoinChatRoomPage from './pages/JoinGroupPage';
import ProfilePage from './pages/ProfilePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';
import JoinGroupPage from './pages/JoinGroupPage';
import { useEffect } from 'react';
import { socket } from './socket';
import { UserProvider } from './context/UserContext';
import PleaseVerifyEmailPage from './pages/PleaseVerifyEmailPage';

function App() {

  useEffect(() => {
    return () => {
      socket.disconnect();
    }
  }, []);

  const routes = [{
    path: '/',
    element: <Outlet />,
    errorElement: <NotFoundPage />,
    children: [{
      path: '/',
      element: <ProtectedRoute><ChatPage /></ProtectedRoute>
    }, {
      path: '/login',
      element: <LoginPage />
    }, {
      path: '/register',
      element: <RegisterPage />
    }, {
      path: '/please-verify-email',
      element: <PleaseVerifyEmailPage />
    }, {
      path: '/join-room/:roomId',
      element:
        <ProtectedRoute><JoinChatRoomPage /></ProtectedRoute>
    }, {
      path: '/profile',
      element: <ProtectedRoute><ProfilePage /></ProtectedRoute>
    }, {
      path: '/forgot-password',
      element: <ForgotPasswordPage />
    }, {
      path: 'join-group/:id',
      element: <JoinGroupPage />
    }]
  }]

  const router = createBrowserRouter(routes);

  return (
    <>
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </>
  )
}

export default App;
