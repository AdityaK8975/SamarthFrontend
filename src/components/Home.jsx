import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Home.css'; // External CSS file for the styles
import Sidebar from "./Sidebar";

function Home() {
  const [meetingId, setMeetingId] = useState("");

  const navigate = useNavigate();

  // Create a Meeting (Calls Backend API)


  // Join a Meeting
  const joinMeeting = () => {
    if (!meetingId) {
      alert("Please enter a valid Meeting ID");
      return;
    }
    navigate(`/video-call?roomId=${meetingId}`);
  };

  return (
    <div className="home-container">
      <Sidebar />
      <div className="header">
        <img src="../assets/logo.png" alt="Logo" className="logo" />
     
      </div>
      <div className="meeting-actions">
        
        {/* {meetingId && <p className="meeting-id">Meeting ID: {meetingId}</p>} */}

        <div className="join-section">
          <input
            type="text"
            placeholder="Enter Meeting ID"
            value={meetingId}
            onChange={(e) => setMeetingId(e.target.value)}
            className="meeting-id-input"
          />
          <div className="button-container">
          <button className="btn btn-outline" onClick={joinMeeting}>
            Join Meeting
          </button>
          {/* <h4>OR</h4>
          <button className="btn btn-primary" onClick={() => navigate("/create-meeting")} >
          Create Meeting
        </button> */}
        </div>
        </div>
      </div>
    </div>
  );
}

export default Home;



