import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { requestForToken, onMessageListener } from "./firebase";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import VideoCall from "./components/VideoCall"; // Assume you have a VideoCall component
import CreateMeeting from "./components/CreateMeeting";
import HomeScreen from "./components/HomeScreen";
import AllMeetings from "./components/AllMeeting";
import Home2 from './components/Home'
import UserDashbord from "./components/UserDashbord";
function App() {
 
  return (
    <>
   
    <ToastContainer position="top-right" autoClose={3000} />
    <Router>
      <Routes>

      
        <Route path="/" element={<> <HomeScreen /></>} />
        <Route path="/video-call" element={<VideoCall />} />
        <Route path="/create-meeting" element={<CreateMeeting />} />
        <Route path="/home/:userId" element={<UserDashbord />} />
        <Route path="/admin/:hostId" element={<AllMeetings />} />
        <Route path="/join" element={<Home2/>} />
      
      </Routes>
    </Router>
    </>
  );
}

export default App;
