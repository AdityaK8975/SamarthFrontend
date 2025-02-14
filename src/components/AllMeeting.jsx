import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import HostMeetingScreenDetails from "./HostMeetingScreenDetails";
import './AllMeetings.css';
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";

const AllMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const hostId = "1001"; // Temporary hardcoded host ID

  // ✅ Move fetchMeetings outside of useEffect
  const fetchMeetings = async () => {
    try {
      const response = await axios.get(`https://samarthmeet.onrender.com/host/${hostId}`);
      const sortedMeetings = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));

      setMeetings(sortedMeetings);
    } catch (err) {
      console.error("Error fetching meetings:", err);
      setError("Failed to fetch meetings. Please try again.");
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleCancelMeeting = async (meetingId) => {
    try {
      const cancelReason = prompt("Please enter the reason for canceling this meeting:");     
      if (!cancelReason || cancelReason.trim() === "") {
        // alert("❌ Cancellation reason is required!");
        toast.error("❌ Cancellation reason is required!");

        return;
      }
      const response = await axios.put(`http://localhost:5000/api/meetings/cancel/${meetingId}`,
        { cancelReason });

        toast.success("✅ Meeting cancelled!");

      // ✅ Update state immediately without reloading
      setMeetings((prevMeetings) =>
        prevMeetings.map((meeting) =>
          meeting._id === meetingId ? { ...meeting, status: "Canceled", cancelReason  } : meeting
        )
      );

      // ✅ Fetch fresh data from backend (optional)
      fetchMeetings();
    } catch (error) {
      // console.error("❌ Cancel Error:", error);
      // alert("❌ Error canceling meeting!");
      toast.error("❌ Error canceling meeting!.");
    }
  };
 

  return (
    <div className="meeting-container">
      <Sidebar />
      <center><h2>All Meetings Created by Host</h2></center>
      {error && <p className="error-text">{error}</p>}

      {meetings.length > 0 ? (
        <ul className="meeting-list">
          {meetings.map((meeting) => (
            <div key={meeting._id} className="meeting-item">
            
              <p>Status: <strong>{meeting.status === "Canceled" ?`❌ Canceled (${meeting.cancelReason || "No reason provided"})`: "✅ Active"}</strong></p>

              {meeting.status !== "Canceled" && (
                <button onClick={() => handleCancelMeeting(meeting._id)} className="cancel-btn">
                  ❌ Cancel Meeting
                </button>
              )}
                <HostMeetingScreenDetails meeting={meeting} />
            </div>
          ))}
        </ul>
      ) : (
        <p>No meetings found for this host.</p>
      )}
    </div>
  );
};

export default AllMeetings;
