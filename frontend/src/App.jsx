import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Task from "./pages/Task";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";  // <-- 🆕 Import Notifications
import NotFound from "./pages/NotFound";

import { saveProfile } from "./redux/actions/authActions";

function App() {
  const authState = useSelector(state => state.authReducer);
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    dispatch(saveProfile(token));
  }, [authState.isLoggedIn, dispatch]);

  return (
    <BrowserRouter>
      <Routes>

        {/* Home Page */}
        <Route path="/" element={<Home />} />

        {/* Profile Page (protected) */}
        <Route 
          path="/profile" 
          element={authState.isLoggedIn ? <Profile /> : <Navigate to="/login" state={{ redirectUrl: "/profile" }} />} 
        />

        {/* Notifications Page (protected) */}
        <Route 
          path="/notifications" 
          element={authState.isLoggedIn ? <Notifications /> : <Navigate to="/login" state={{ redirectUrl: "/notifications" }} />} 
        />

        {/* Add New Task (protected) */}
        <Route 
          path="/tasks/add" 
          element={authState.isLoggedIn ? <Task /> : <Navigate to="/login" state={{ redirectUrl: "/tasks/add" }} />} 
        />

        {/* Edit Task (protected) */}
        <Route 
          path="/tasks/:taskId" 
          element={authState.isLoggedIn ? <Task /> : <Navigate to="/login" state={{ redirectUrl: window.location.pathname }} />} 
        />

        {/* Signup Page */}
        <Route 
          path="/signup" 
          element={authState.isLoggedIn ? <Navigate to="/" /> : <Signup />} 
        />

        {/* Login Page */}
        <Route 
          path="/login" 
          element={authState.isLoggedIn ? <Navigate to="/" /> : <Login />} 
        />

        {/* Catch-all 404 Not Found Page */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
