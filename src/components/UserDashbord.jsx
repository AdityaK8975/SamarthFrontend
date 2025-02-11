import React, { useEffect, useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import MeetingCard from "./MeetingCard";
import { fetchMeetingsByUserId } from "./routefetch/fetchMeetingData";
import './Homescreen.css'
import { io } from "socket.io-client";  // Import socket.io client


const socket = io("http://localhost:5000");
const UserDashbord = () => {

  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();
  const { userId } =useParams(); // Get userId from URL params  useParams();
  useEffect(() => {
    const fetchMeetings = async () => {
      const fetchedMeetings = await fetchMeetingsByUserId(userId);
      if (fetchedMeetings) {
        setMeetings(fetchedMeetings);
     
      }
    };
  
    fetchMeetings();

    // WebSocket Connection Setup
   socket.on("connect" , () => {
      console.log(`✅ WebSocket Connected! Registering user: ${userId}`);
      socket.emit("registerUser", userId);
    });
  
    socket.on("disconnect" ,() => {
      console.warn("⚠️ WebSocket Disconnected. Retrying...");
    });
  
    socket.on("newMeeting" , (data) => {
      console.log("New Meeting Received:", data);
      setMeetings((prevMeetings) => [data, ...prevMeetings]);
  
      alert(`📅 New Meeting Scheduled: ${data.title} at ${data.time}`);

      
    });
  
  
    // Cleanup function to prevent duplicate listeners
    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("newMeeting");
    };
  }, [userId]);  // Dependency only on `userId`
  

//   const joinMeeting = () => {
//     if (!meetings.meetingId) {
//       alert("Please enter a valid Meeting ID");
//       return;
//     }
//     navigate(`/video-call?roomId=${meetings.meetingId}`);
//   };

  return (
<>

        {/* Main Content */}
        <div className="main-content">
          <h2 className="section-title">Upcoming Meetings</h2>
    
          {meetings.length > 0 ? (
            <div className="meetings-grid">
{console.log(meetings)}

              {meetings.map((meeting) => (
              
                <MeetingCard key={meeting.meetingId} meeting={meeting} userId={userId} />
              ))}
            </div>
          ) : (
            <p className="no-meetings">No upcoming meetings scheduled.</p>
          )}
        </div>
   
      </>
  
);
};

export default  UserDashbord;


