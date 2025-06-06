import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import { useEffect } from "react";
import {Signup} from "./pages/Signup.jsx";
import {Signin} from "./pages/Signin.jsx";
import {Dashboard} from "./pages/Dashboard.jsx";
import { Profile } from "./pages/Profile.jsx";
import {EditProfile} from "./pages/EditProfile.jsx";


function CheckAuth({path}) {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    token ? navigate(path) : navigate('/signin');
  }, [token, navigate, path]);
}

function App() {
  return <div>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<CheckAuth path='/dashb'/>}></Route>

        <Route path='/signup' element={<Signup/>}></Route>
        <Route path='/signin' element={<Signin />}></Route>

        <Route path='/dashb' element={<CheckAuth path='/dashboard'/>}></Route>
        <Route path='/dashboard' element={<Dashboard/>}></Route>

        <Route path='/profile' element={<Profile />}></Route>
        <Route path='/edit-profile' element={<EditProfile />}></Route>

        <Route path='*' element={<h1 className="text-center text-2xl mt-20">404 Not Found</h1>}></Route>
      </Routes>
    </BrowserRouter>
  </div>
}

export default App
