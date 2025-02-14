import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import './MeetingCard.css'
import HostMeetingScreenDetails from "./HostMeetingScreenDetails";
const MeetingCard = ({ meeting, isHost, userId }) => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(meeting.invitedUsers.find(user => user.userId === userId)?.status || "Pending");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showReasonInput, setShowReasonInput] = useState(false);

  // const fetchUpdatedMeeting = async () => {
  //   try {
  //     const response = await fetch(`http://localhost:5000/meeting/${meeting.meetingId}`);
  //     const updatedMeeting = await response.json();
  //     setMeeting(updatedMeeting); // Update state with new data
  //   } catch (error) {
  //     console.error("Error fetching updated meeting:", error);
  //   }
  // };
  const updateMeetingResponse = async (meetingId, userId, responseStatus, reason = null) => {
    try {
      const res = await fetch("http://localhost:5000/update-response", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meetingId, userId, status: responseStatus, reasonForRejection: reason }),
      });
  
      const data = await res.json();
      if (res.ok) {
        setStatus(responseStatus);
        if (responseStatus === "Rejected") {
          setRejectionReason(reason);
          setShowReasonInput(false);
        }
  
        // 🔄 Fetch updated meeting details after response update
        fetchUpdatedMeeting();
      } else {
        console.error("Error:", data.message);
      }
    } catch (error) {
      console.error("Error updating response:", error);
    }
  };
  
  // 🔄 Function to refetch updated meeting details
 
  

  const handleAccept = () =>  updateMeetingResponse(meeting.meetingId, userId, "Accepted");
  const handleReject = () => setShowReasonInput(true);
  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      alert("Please enter a reason for rejection.");
      toast.error("Please enter a reason for rejection.");

      return;
    }
    updateMeetingResponse(meeting.meetingId, userId, "Rejected", rejectionReason);
  };

  return (
    <div className="meeting-card" style={{
      border: meeting.isCompulsory ? "2px solid red" : "2px solid #ddd"
    }}>
      <div
        className="meeting-header"
        onClick={() => navigate(`/meeting-details/${meeting.meetingId}`)}
      >
        <h3 className="meeting-title" style={{ color: meeting.isCompulsory ? "red" : "black"}}>{meeting.title}{meeting.isCompulsory ?" (Compulsory)":""}</h3>
        <h4>{meeting.isCompulsory}</h4>
        <span className={`meeting-type ${meeting.meetingType === "Offline" ? "offline" : "online"}`}>
          {meeting.meetingType === "Offline" ? "🏢 Offline Meeting" : "💻 Online Meeting"}
        </span>
      </div>

      <div className="meeting-details" >
        <p>📅 {new Date(meeting.date).toDateString()}</p>
        <p>⏰ {meeting.timeFrom}-⏰ {meeting.timeTo}</p>
      </div>
      <div className="meeting-details">
        <p> <strong>Description </strong> - {meeting.description}</p>
        <p><strong> Meeting-Id</strong>  - {meeting.meetingId}</p>
        <p>Status: <strong>{meeting.status === "Canceled" ? `❌ Canceled (${meeting.cancelReason || "No reason provided"})` : "✅ Active"}</strong></p>
      </div>
      {meeting.meetingType === "Offline" && (
        <div className="offline-details">
          <p>📍 <strong>Location:</strong> {meeting.location}</p>
          <p>🛍 <strong>Required Items:</strong> {meeting.requiredItems}</p>
        </div>
      )}
    
      {meeting.status !== "Canceled" ? (
  status === "Pending" ? (
    <div className="action-buttons">
      <button className="btn btn-accept" onClick={handleAccept}>
        Accept
      </button>
      {!meeting.isCompulsory &&
      <button className="btn btn-reject" onClick={handleReject }   >
        Reject
      </button>
       }
    </div>
  ) : status === "Accepted" ? 
  (
    meeting.meetingType === "Offline" ? (
      <p className="accepted-text">✅ You have accepted this offline meeting.</p>
    ) : (
      <button className="btn btn-join" onClick={() => navigate(`/video-call?roomId=${meeting.meetingId}&uid=${userId}`)}>Join Meeting</button>
    )
  ) : (
    <div>
      <p className="rejected-text">❌ You have rejected this meeting.</p>
      {rejectionReason && <p><strong>Reason:</strong> {rejectionReason}</p>}
    </div>
  )
) 
//   (
//     <button
//       className="btn btn-join"
//       onClick={() => navigate(`/video-call?roomId=${meeting.meetingId}`)}
//     >
//       Join Meeting
//     </button>
//   ) : (
//     <div>
//       <p className="rejected-text">You have rejected this meeting.</p>
//       {rejectionReason && <p><strong>Reason:</strong> {rejectionReason}</p>}
//     </div>
//   )
// ) 
: (
  <p className="canceled-text">❌ This meeting has been canceled.</p>
)}

      {showReasonInput && (
        <div className="reason-input">
          <textarea
            placeholder="Enter reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
      <button className="btn btn-submit-reason" onClick={() => submitRejection()}>
  Submit Reason
</button>

        </div>
      )}

      {isHost && (
        <div className="host-rejection-list">
          <h4>Responses:</h4>
          <ul>
            {meeting.invitedUsers.map((user) => (
              <li key={user.userId}>
                {user.name} - {user.status === "Accepted" ? "✅ Accepted" : `❌ Rejected (${user.reasonForRejection || "No reason"})`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MeetingCard;
