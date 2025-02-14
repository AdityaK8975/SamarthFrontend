import React from "react";
import { useNavigate } from "react-router-dom";
import "./Sidebar.css"; // Import sidebar styles

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <div className="sidebar">
         <img src="../assets/logo.png" alt="Logo" height={80}  style={{marginBottom:40}}/>
      <button className="btn btn-outline" onClick={() => navigate('/join')}>
        Join Meeting
      </button>
      
      <button className="btn btn-primary" onClick={() => navigate("/create-meeting")}>
        Create Meeting
      </button>
      
      <button className="btn btn-success" onClick={() => navigate(`/admin/1001`)}>
        View All Meetings
      </button>
    </div>
  );
};

export default Sidebar;
