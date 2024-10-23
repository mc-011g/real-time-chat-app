import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login.js";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import ChatDashboard from './components/ChatDashboard.js';
import Profile from './components/Profile.js';
import Register from './components/Register.js';
import JoinRoom from './components/JoinRoom.js';
import './App.css';
import ProtectedRoute from "./components/ProtectedRoute.js";
import { RoomProvider } from "./context/RoomContext.js";
import { WebSocketClientProvider } from "./context/WebSocketClientContext.js";
import { useEffect } from "react";


function App() {
  //Set title of web page
  useEffect(() => {
    document.title = "Chat App"
  }, []);

  return (
    <div className="App">
      <BrowserRouter>
        <RoomProvider>
          <WebSocketClientProvider>
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path='/' element={<ChatDashboard />} />
              </Route>
              <Route path='/Login' element={<Login />} />
              <Route element={<ProtectedRoute />}>
                <Route path="profile" element={<Profile />} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/join" element={<JoinRoom />} />
              </Route>
              <Route path='/Register' element={<Register />} />
            </Routes>
          </WebSocketClientProvider>
        </RoomProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
