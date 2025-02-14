import React, { useEffect, useState } from "react";
import { useNavigate,useParams } from "react-router-dom";
import MeetingCard from "./MeetingCard";
import { fetchMeetingsByUserId } from "./routefetch/fetchMeetingData";
import './Homescreen.css'
import Sidebar from "./Sidebar";
import'./UserDashboard.css'

import { fetchNotificationsByUserId,markNotificationAsRead } from "./routefetch/fetchNotifications";
const timeAgo = (timestamp) => {
  const now = new Date();
  const diffInMs = now - new Date(timestamp);
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  return `${diffInHours} hr${diffInHours > 1 ? "s" : ""} ago`;
};

const UserDashbord = () => {

  const [meetings, setMeetings] = useState([]);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false); 
  const { userId } =useParams(); // Get userId from URL params  useParams();
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
  useEffect(() => {
    const fetchMeetings = async () => {
      const fetchedMeetings = await fetchMeetingsByUserId(userId);
      if (fetchedMeetings) {
        setMeetings(fetchedMeetings);
     
      }
    };
    const fetchNotifications = async () => {
      const fetchedNotifications = await fetchNotificationsByUserId(userId);
      if (fetchedNotifications) setNotifications(fetchedNotifications);
    };

  
    fetchMeetings();
    fetchNotifications();
  },[userId])
  const unreadCount = notifications.filter(notif => !notif.isRead).length || 0;

      useEffect(() => {
          const fetchNotifications = async () => {
              try {
                  const response = await fetchNotificationsByUserId(userId);
                  setNotifications(response);
              } catch (err) {
                  setError("Failed to fetch notifications");
                  console.error("Error fetching notifications:", err);
              } finally {
                  setLoading(false);
              }
          };
  
          fetchNotifications();
      }, [userId]);
  
      const handleMarkAsRead = async (id) => {
          try {
              await markNotificationAsRead(id);
              setNotifications(notifications.map((notif) =>
                  notif._id === id ? { ...notif, isRead: true } : notif
              ));
          } catch (err) {
              console.error("Error marking notification as read:", err);
          }
      };

  return (
<>
<Sidebar />
<div className="header">

<h2 className="section-title">Upcoming Meetings</h2>
<div className="notification-bell" onClick={() => setShowDropdown(!showDropdown)}>
          <span className="bell-icon">🔔</span>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
  </div>

        {/* Dropdown for Notifications */}
        {showDropdown && (
          <div className="notifications-dropdown">
           {loading ? (
                <div className="loader"></div>
            ) : error ? (
                <p className="error-text">{error}</p>
            ) : (
              <ul className="notification-list">
              {notifications.map((item) => (
                  <li key={item._id} className={`notification-card ${item.isRead ? "read" : "unread"}`}>
                      <p className={`notification-message ${item.message.includes("canceled") ? "canceled" : ""}`}>
                          {item.message.includes("canceled") ? "❌ Meeting Canceled: " : "📅"} {item.message}
                      </p>
                      <p className="notification-details">
                          📅 {new Date(item.timestamp).toLocaleDateString()} | ⏰ {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                      <p className="meeting-id">📌 Meeting ID: {item.meetingId}</p>
          
                      <div className="notification-bottom">
                          <span className="time-ago">{timeAgo(item.timestamp)}</span>
                          {!item.isRead && (
                              <button className="ok-button" onClick={() => handleMarkAsRead(item._id)}>OK</button>
                          )}
                      </div>
                  </li>
              ))}
          </ul>
          
            )}
          </div>
        )}


      </div>
        <div className="main-content">
      
        
          {meetings.length > 0 ? (
            <div className="meetings-grid">

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


