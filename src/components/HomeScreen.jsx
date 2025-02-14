// import React, { useEffect, useState } from "react";
// import { useNavigate,useParams } from "react-router-dom";
// import MeetingCard from "../components/MeetingCard";

// import './Homescreen.css'

// const HomeScreen = () => {
//  const navigate = useNavigate();

//   // const joinMeeting = () => {
//   //   if (!meetings.meetingId) {
//   //     // alert("Please enter a valid Meeting ID");
//   //     toast.error("Please enter a valid Meeting ID");

//   //     return;
//   //   }
//   //   navigate(`/video-call?roomId=${meetings.meetingId}`);
//   // };

//   return (
   
//       <div className="home-container">
//         {/* Sidebar */}
//         <div className="sidebar">
//           <button className="btn btn-outline" onClick={() => navigate('/join')}>
//             Join Meeting
//           </button>
    
//           <button className="btn btn-primary" onClick={() => navigate("/create-meeting")}>
//             Create Meeting
//           </button>
    
//           <button className="btn btn-success" onClick={() => navigate(`/admin/1001`)}>
//             View All Meetings
//           </button>
//         </div>
 
//       </div>
  
// );
// };

// export default HomeScreen;


import React from "react";
import Sidebar from "./Sidebar"; // Import Sidebar
import "./Homescreen.css"; // Existing styles

const HomeScreen = () => {
  return (
    <div className="home-container">
      <Sidebar /> {/* Sidebar is now separate */}
      <div className="main-content">
        <h1>Welcome to the Samarth meeting</h1>
        <p></p>
      </div>
    </div>
  );
};

export default HomeScreen;
