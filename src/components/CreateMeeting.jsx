import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { fetchMeetingId } from "./routefetch/fetchMeetingId";
import { fetchAllUsersData } from "./routefetch/fetchUserData";
// import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import './CreateMeeting.css'
import Sidebar from "./Sidebar";
const CreateMeeting = () => {
  const [username, setUsername] = useState("");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [description, setDescription] = useState("");
  const [meetingDate, setMeetingDate] = useState(new Date());
  const [meetingTimeFrom, setMeetingTimeFrom] = useState(new Date());
  const [meetingTimeTo, setMeetingTimeTo] = useState(new Date());
  const [meetingId, setMeetingId] = useState("");
  const [isCreated, setIsCreated] = useState(false);
  const [error, setError] = useState(null);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [usersData, setUsersData] = useState([]);
  const [meetingType, setMeetingType] = useState("Online"); // Default to Online
  const [location, setLocation] = useState("");
  const [requiredItems, setRequiredItems] = useState("");
 const [isCompulsory,setIsCompulsory]=useState();

  
  useEffect(() => {
    const getUsers = async () => {
      const users = await fetchAllUsersData();
      if (users) {
        const formattedUsers = users.map((user) => ({
          value: user.UserId,
          label: `${user.firstName} ${user.lastName}`,
          email:user.email,
        }));
        setUsersData(formattedUsers);
      } else {
        setError("Failed to fetch users data.");
      }
    };
    getUsers();
  }, []);
  const validateForm = () => {
    if (!username.trim() || username.trim().length < 2) {
      setError("Username must be at least 2 characters long.");
      return false;
    }
    if (!meetingTitle.trim() || meetingTitle.trim().length < 2) {
      setError("Meeting Title must be at least 2 characters long.");
      return false;
    }
    if (description.trim().length > 0 && description.trim().length < 2) {
      setError("Description must be at least 2 characters long.");
      return false;
    }
    if (!meetingDate) {
      setError("Meeting Date is required.");
      return false;
    }
    if (meetingDate < new Date().setHours(0, 0, 0, 0)) {
      setError("Meeting Date cannot be in the past.");
      return false;
    }
    if (!invitedUsers.length) {
      setError("Please invite at least one user.");
      return false;
    }
    if (meetingType === "Offline") {
      if (!location.trim()) {
        setError("Location is required for offline meetings.");
        return false;
      }
      if (!requiredItems.trim()) {
        setError("Please specify required items for offline meetings.");
        return false;
      }
    }
    
    setError(null);
    return true;
  };
  

  const handleCreateMeeting = async () => {
    if (!validateForm()) return;
    try {
      console.log("🔄 Creating Meeting...");
      setError(null);
      const newMeetingId = await fetchMeetingId();
      if (!newMeetingId) throw new Error("Failed to fetch Meeting ID");

      setMeetingId(newMeetingId);
     
      setError(null);

      const generatedLink = meetingType === "Online"? `http://localhost:5173/video-call?roomId=${newMeetingId}`
      : "";

      const meetingData = {
        meetingSrNo: newMeetingId,
        title: meetingTitle,
        description: description || "",
        date: meetingDate.toISOString().split("T")[0], // YYYY-MM-DD format
        timeFrom: meetingTimeFrom.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        timeTo: meetingTimeTo.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }),
        meetingId: newMeetingId,
        meetingLink: generatedLink,
        meetingType: meetingType,
        status:'',
        requiredItems: requiredItems,
        location:location,
        cancelReason:"",
        isCompulsory: isCompulsory, 
        invitedUsers: invitedUsers.map((user) => ({
          userId: user.value,

          name: user.label,

          status:'Pending',
          email:user.email
         
        })),
        host: "1001",
      };

      // console.log("Sending Meeting Data:", meetingData);

      const response = await axios.post(
        "http://localhost:5000/api/meetings/store",
        meetingData
      );
      setIsCreated(true);

      // console.log("✅ Meeting Created Successfully!", response.data);
      toast.success("✅ Meeting created successfully!");

     

    } catch (err) {
      console.error("❌ Error Creating Meeting:", err.response?.data?.message || err.message);
        setError(err.response?.data?.message || "Failed to create meeting.");
        toast.error("❌ Failed to create meeting." + (err.response?.data?.message || "Error: Failed to create meeting."));
        // alert("❌ " + (err.response?.data?.message || "Error: Failed to create meeting."));
    }
  };
  const navigate = useNavigate();

  const joinMeeting = () => {
    if (!meetingId) {
      // alert("Please generate a Meeting ID first");
      toast.error('Please generate a Meeting ID first');
      return;
    }
    navigate(`/video-call?roomId=${meetingId}`);
  };
  return (
    <div className="container">
      <Sidebar />
      <h2>{isCreated ? "Meeting Created" : "Create a Meeting"}</h2>

      {!isCreated ? (
        <div className="form-container">
<label className="compulsory-checkbox">
    <input
    type="checkbox"
    checked={isCompulsory}
    onChange={(e) => setIsCompulsory(e.target.checked)}
  />
  <span className="checkmark"></span>
  Compulsory Meeting
</label>
          <input
            type="text"
            placeholder="Enter Your Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Meeting Title"
            value={meetingTitle}
            onChange={(e) => setMeetingTitle(e.target.value)}
          />

          <textarea
            placeholder="Enter meeting description..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />
        <select
            value={meetingType}
            onChange={(e) => setMeetingType(e.target.value)}
            className="user"
          >
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
          </select>

          {meetingType === "Offline" && (
            <>
              <input
                type="text"
                placeholder="Enter Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <input
                type="text"
                placeholder="Required Items to Bring"
                value={requiredItems}
                onChange={(e) => setRequiredItems(e.target.value)}
              />
            </>
          )}
          {/* Multi-Select Dropdown */}
          <Select
            options={usersData}
            isMulti
            placeholder="Select Users to Invite"
            value={invitedUsers}
            onChange={setInvitedUsers}
            className="user"
          />

          {/* Date and Time Picker */}
          <div className="date-time-row">
            <DatePicker
              selected={meetingDate}
              onChange={(date) => setMeetingDate(date)}
              dateFormat="yyyy-MM-dd"
              className="picker"
              minDate={new Date()} 
            />
            <DatePicker
              selected={meetingTimeFrom}
              onChange={(time) => setMeetingTimeFrom(time)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeFormat="h:mm aa"
              dateFormat="h:mm aa"
              className="picker"
            />
             <DatePicker
              selected={meetingTimeTo}
              onChange={(time) => setMeetingTimeTo(time)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeFormat="h:mm aa"
              dateFormat="h:mm aa"
              className="picker"
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button className="btn btn-primary" onClick={handleCreateMeeting}>
            Create Meeting
          </button>
        </div>
      ) : (
        <div className="meeting-details">
          <p>
            <strong>Meeting Title:</strong> {meetingTitle}
          </p>
          <p>
            <strong>Description:</strong> {description}
          </p>
          <p>
            <strong>Date:</strong> {meetingDate.toDateString()}
          </p>
          <p>
            <strong>Time:</strong>{" "}
            {meetingTimeFrom.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
            -
            {meetingTimeTo.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
          <p>
            <strong>Meeting Type:</strong> {meetingType}
          </p>
          {meetingType === "Offline" && (
            <>
              <p>
                <strong>Location:</strong> {location}
              </p>
              <p>
                <strong>Required Items:</strong> {requiredItems}
              </p>
            </>
          )}
          <p>
            <strong>Invited Users:</strong>
          </p>
          <ul>
            {invitedUsers.map((user) => (
              <li key={user.value}>{user.label}</li>
            ))}
          </ul>
          <p>
            <strong>Meeting ID:</strong>{" "}
            <span className="meeting-id">{meetingId}</span>
          </p>
          <p>
  <strong>Meeting Link:</strong>{" "}
  <span className="meeting-id">
    `http://localhost:5173/video-call?roomId=${meetingId}`
  </span>
</p>

        </div>
      )}
{isCreated && (
<>


      <button className="btn btn-danger" onClick={() => navigate(-1)}>
        Back
      </button>

      {meetingType === "Online" && (
        <button
          className="btn btn-success"
          onClick={joinMeeting}
        >
          Start Meeting
        </button>
      )}
      </>
   ) }
    </div>
  );
};

export default CreateMeeting;
