import React, { useState } from "react";
import './HomeMeetingScreen.css';

const HostMeetingScreenDetails = ({ meeting }) => {
  const [filter, setFilter] = useState("All");
  const [showParticipants, setShowParticipants] = useState(false); // Dropdown toggle state

  const totalParticipants = meeting.invitedUsers ? meeting.invitedUsers.length : 0;
  const totalAccepted = meeting.invitedUsers?.filter(user => user.status === "Accepted").length || 0;
  const totalRejected = meeting.invitedUsers?.filter(user => user.status === "Rejected").length || 0;
  const totalPending = meeting.invitedUsers?.filter(user => user.status === "Pending").length || 0;

  const filteredParticipants = meeting.invitedUsers.filter(user => 
    filter === "All" || user.status === filter
  );

  return (
    <div className="container">
      {/* Meeting Header */}
      <div className="meeting-header">
        <h2 className="title">{meeting.title}</h2>
        <span className="meeting-type">{meeting.meetingType}</span>
      </div>
      
      {/* Meeting Details */}
      <div className="meeting-details">
        <p><strong>Meeting ID:</strong> {meeting.meetingId}</p>
        <p><strong>Date:</strong> {new Date(meeting.date).toDateString()}</p>
        <p><strong>Time:</strong> {meeting.time}</p>
        {meeting.meetingLink && (
          <p><strong>Meeting Link:</strong> <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">{meeting.meetingLink}</a></p>
        )}
         <div className="stats-container">
            <span>Total: {totalParticipants}</span>
            <span className="accepted">Accepted: {totalAccepted}</span>
            <span className="rejected">Rejected: {totalRejected}</span>
            <span className="pending">Pending: {totalPending}</span>
          </div>

      </div>

      {/* Participants Dropdown Button */}
      <button 
        className="dropdown-btn" 
        onClick={() => setShowParticipants(!showParticipants)}
      >
        {showParticipants ? "Hide Participants" : "Show Participants"}
      </button>

      {/* Show participants only when dropdown is open */}
      {showParticipants && (
        <div className="participants-section">
          {/* Stats Summary */}
         
          {/* Participant Filter Buttons */}
          <div className="filter-container">
            {["All", "Accepted", "Rejected", "Pending"].map(status => (
              <button 
                key={status} 
                className={`filter-button ${filter === status ? "active-filter" : ""}`} 
                onClick={() => setFilter(status)}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Participants List */}
          {filteredParticipants.length > 0 ? (
            <ul className="participant-list">
              {filteredParticipants.map((user) => (
                <li key={user.userId} className={`participant-card ${user.status.toLowerCase()}`}>
                  <div className="participant-row">
                    <span className="participant-name">{user.name}</span>
                    <span className={`participant-status ${user.status.toLowerCase()}`}>
                      {user.status}
                    </span>
                  </div>
                  {user.status === "Rejected" && (
                    <p className="rejection-reason">Reason: {user.reasonForRejection}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-participants">No participants available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default HostMeetingScreenDetails;
