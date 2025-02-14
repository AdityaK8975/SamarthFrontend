import React, { useEffect, useState,useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";
import "./VideoCall.css"
const APP_ID = "d59df11bf39f4acb8d49ab9e6ab2cd76"; // Replace with your Agora App ID
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
const fetchUserDetails = async (userId) => {
  console.log("Fetching user details for UID:", userId); // Debugging step
  if (!userId) return `User ${userId}`; // Avoid fetching if userId is undefined

  try {
    const response = await fetch(`http://localhost:5000/user/${userId}`);
    if (!response.ok) throw new Error("User not found");
    const userData = await response.json();
    console.log("User data received:", userData); // Debugging step
    return `${userData.firstName} ${userData.lastName}`;
  } catch (error) {
    console.error(`Error fetching user ${userId}:, error`);
    return `User ${userId}`; // Fallback
  }
};


function VideoCall() {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingUrl, setRecordingUrl] = useState(null);
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);
  const [userNames, setUserNames] = useState({});

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [expandedUser, setExpandedUser] = useState(null);
  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const[myid,setmyId]=useState()
  const [mainUser, setMainUser] = useState("local");


 
  
  const navigate = useNavigate();



  const switchMainUser = async (uid) => {
    setMainUser((prevMainUser) => {
      const newMainUser = uid === prevMainUser ? "local" : uid;
      console.log(`Switching main user from ${prevMainUser} to ${newMainUser}`);
  
      const playVideoTrack = (track, containerId, userName, isLocal) => {
        if (!track) {
          console.error(`No video track found for ${userName} in ${containerId}`);
          return;
        }
  
        const container = document.getElementById(containerId);
        if (!container) {
          console.error(`Container not found: ${containerId}`);
          return;
        }
  
        // Clear existing content
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
  
        // Add username element
        const nameElement = document.createElement('div');
        nameElement.className = 'user-name';
        nameElement.textContent = userName;
        container.appendChild(nameElement);
  
        try {
          // For local tracks, we need to handle them differently
          if (isLocal) {
            console.log(`Playing local track in ${containerId}`);
            // Create a new div for the video
            const videoDiv = document.createElement('div');
            videoDiv.style.width = '100%';
            videoDiv.style.height = '100%';
            container.appendChild(videoDiv);
            track.play(videoDiv);
          } else {
            // For remote tracks, play directly in container
            track.play(containerId);
          }
          console.log(`Successfully playing video for ${userName} in ${containerId}`);
        } catch (error) {
          console.error(`Error playing video for ${userName} in ${containerId}:, error`);
        }
      };
  
      // Schedule updates with proper timing
      setTimeout(() => {
        // Handle main container first
        if (newMainUser === "local" && localTracks[1]) {
          console.log("Playing local video in main container");
          playVideoTrack(
            localTracks[1],
            "main-video-container",
            "You (Main)",
            true // isLocal flag
          );
        } else if (remoteUsers[newMainUser]?.videoTrack) {
          console.log("Playing remote video in main container");
          playVideoTrack(
            remoteUsers[newMainUser].videoTrack,
            "main-video-container",
            `${userNames[newMainUser] } (Main)`
          );
        }
  
        // Handle all other videos
        ["local", ...Object.keys(remoteUsers)]
          .filter(userId => userId !== newMainUser)
          .forEach(userId => {
            const containerId = `user-${userId}`;
            if (userId === "local" && localTracks[1]) {
              console.log("Playing local video in small container");
              playVideoTrack(
                localTracks[1],
                containerId,
                "You",
                true // isLocal flag
              );
            } else if (userId !== "local" && remoteUsers[userId]?.videoTrack) {
              console.log("Playing remote video in small container");
              playVideoTrack(
                remoteUsers[userId].videoTrack ,
                containerId,
                userNames[userId] || `User ${userId}`,

              );
            }
          });
      }, 100);
  
      return newMainUser;
    });
  };



  useEffect(() => {
    const updateUserNames = async () => {
      const updatedNames = {};
      for (let uid in remoteUsers) {
        if (!userNames[uid]) {
          updatedNames[uid] = await fetchUserDetails(uid);
        }
      }
      setUserNames(prev => ({ ...prev, ...updatedNames }));
    };
  
    updateUserNames();
  }, [remoteUsers]);
  
    
  
  useEffect(() => {
    if (!roomId) {
      alert("Invalid Room ID");
      return;
    }
    const getUidFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      return params.get("uid"); // Get 'uid' from the URL
    };
    const getChannelNameFromURL = () => {
      const params = new URLSearchParams(window.location.search);
      return params.get("roomId"); // Extract 'roomId' from URL
    };
    const joinMeeting = async () => {
      try {
        const uid = getUidFromURL();
        const channelName = getChannelNameFromURL();
        if (!uid) {
          console.error("Error: UID not found in URL");
          return;
        }
      
        
        
        if (!roomId) {
          console.error("Invalid Room ID");
          alert("Invalid Room ID.");
          return;
        }
    
        
        const response = await fetch(`http://localhost:5000/token?channel=${channelName}&uid=${uid}`);
        const tokenData = await response.json();
        if (!tokenData.token) throw new Error("Token generation failed");
       

        await client.join(APP_ID, tokenData.channel,tokenData.token, tokenData.uid);
    
        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks(tracks);
    
        tracks[1].play("local-player");
        await client.publish(tracks);
    
        // 🟢 Fix: Subscribe to all existing users when joining
        client.remoteUsers.forEach(async (user) => {
          console.log(`Subscribing to existing user: ${user.uid}`);
          await subscribeToUser(user, "video"); // Subscribe to video
          await subscribeToUser(user, "audio"); // Subscribe to audio
        });
    
        client.on("user-published", async (user, mediaType) => {
          if (mediaType === "video" || mediaType === "audio") {
            await subscribeToUser(user, mediaType);
          }
        });
    
        client.on("user-unpublished", (user) => {
          setRemoteUsers((prev) => {
            const updated = { ...prev };
            delete updated[user.uid];
            return updated;
          });
        });
    
        client.on("user-left", (user) => {
          setRemoteUsers((prev) => {
            const updated = { ...prev };
            delete updated[user.uid];
            return updated;
          });
        });
        client.on("user-info-updated", (uid, msg) => {
          console.log(`User ${uid} updated:, msg`);
          setRemoteUsers((prev) => {
            const updated = { ...prev };
            updated[uid] = { ...updated[uid], ...msg };
            return updated;
          });
        });
      } catch (error) {
        console.error("Failed to join meeting:", error);
      }
    };
    
    

    joinMeeting();

    return () => {
      client.leave();
      localTracks.forEach((track) => track.close());
    };
  }, [roomId]);

  
  useEffect(() => {
    Object.keys(remoteUsers).forEach((uid) => {
      const user = remoteUsers[uid];
      if (user.videoTrack) {
        user.videoTrack.play(`user-${uid}`);
      }
    });
  }, [remoteUsers]);
  
  const subscribeToUser = async (user, mediaType) => {
    if (!user || (mediaType !== "video" && mediaType !== "audio")) {
      console.error("Invalid media type:", mediaType);
      return;
    }
  
    try {
      await client.subscribe(user, mediaType);
  
      if (mediaType === "video" && user.videoTrack) {
        user.videoTrack.play(`user-${user.uid}`);
      }
  
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.play();
      }
      const userName = await fetchUserDetails(user.uid);
      setUserNames((prev) => {
        
        console.log("Updating userNames state:", { ...prev, [user.uid]: userName });

        return { ...prev, [user.uid]: userName };
      });
      setRemoteUsers((prev) => ({ ...prev, [user.uid]: user }));
    } catch (error) {
      console.error("Subscription failed:", error);
    }
  };
  
  

  // const toggleMic = async () => {
  //   if (localTracks[0]) {
  //     await localTracks[0].setEnabled(!micEnabled);
  //     setMicEnabled(!micEnabled);
  //   }
  // };
  const toggleMic = async () => {
    if (localTracks[0]) {
      await localTracks[0].setEnabled(!micEnabled);
      setMicEnabled(!micEnabled);
  
      // 🟢 Notify other users about the change
      client.publish([localTracks[0]]);
    }
  };
  

  // const toggleVideo = async () => {
  //   if (localTracks[1]) {
  //     await localTracks[1].setEnabled(!videoEnabled);
  //     setVideoEnabled(!videoEnabled);
  //   }
  // };
  const toggleVideo = async () => {
    if (localTracks[1]) {
      await localTracks[1].setEnabled(!videoEnabled);
      setVideoEnabled(!videoEnabled);
  
      // 🟢 Notify other users about the change
      client.publish([localTracks[1]]);
    }
  };

  const leaveMeeting = async () => {
    await client.leave();
    localTracks.forEach((track) => track.close());
    navigate("/");
  };
  const startScreenShare = async () => {
    try {
      if (localTracks[1]) { 
        await client.unpublish(localTracks[1]); 
        localTracks[1].stop();
      }
  
      const screenTrack = await AgoraRTC.createScreenVideoTrack();
  
      await client.publish(screenTrack);
  
      setLocalTracks([localTracks[0], screenTrack]); 
      setIsScreenSharing(true);
      screenTrack.play("local-player");
      screenTrack.on("track-ended", stopScreenShare);
    } catch (error) {
      console.error("Error starting screen share:", error);
    }
  };
  
  const stopScreenShare = async () => {
    try {
      if (localTracks[1]) {
        await client.unpublish(localTracks[1]);
        localTracks[1].close();
      }
  
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
  
      await client.publish([audioTrack, videoTrack]);
      setLocalTracks([audioTrack, videoTrack]);
      videoTrack.play("local-player");
      setIsScreenSharing(false);
      console.log("Screen sharing stopped, camera restored.");
    } catch (error) {
      console.error("Error stopping screen share:", error);
    }
  };
  useEffect(() => {
    console.log("Updated userNames:", userNames);
  }, [userNames]);
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { mediaSource: "screen" },
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting screen recording:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (<>

    <div className="video-call-container" >
    <h2> Video Call</h2>

    <div className="video-grid">
      {/* Local Video - Always Larger */}
      <div id={mainUser === "local" ? "local-player" : `user-${mainUser}`} className="video-item large">
          <p>{mainUser === "local" ? "You" : userNames[mainUser]}</p>
        </div>

      {/* Remote Users */}
      <div className="remote-users two-columns ">
      {["local", ...Object.keys(remoteUsers)].filter(uid => uid !== mainUser).map((uid) => (
            <div key={uid} id={uid === "local" ? "local-player" : `user-${uid}`} className="video-item small" onClick={() => switchMainUser(uid)}>
              <p>{uid === "local" ? "You" : userNames[uid]}</p>
            </div>
          ))}
      </div>


    {/* Controls */}
    <div className="controls">
      <button onClick={toggleMic} className={micEnabled ? "btn green" : "btn red"}>
        {micEnabled ? "Mute Mic" : "Unmute Mic"}
      </button>

      <button onClick={toggleVideo} className={videoEnabled ? "btn green" : "btn red"}>
        {videoEnabled ? "Turn Video Off" : "Turn Video On"}
      </button>

      <button onClick={leaveMeeting} className="btn red">
        End Call
      </button>
      <button
        onClick={isScreenSharing ? stopScreenShare : startScreenShare}
        style={{
          margin: "10px",
          padding: "10px",
          fontSize: "16px",
          background: isScreenSharing ? "gray" : "blue",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer"
        }}  className="btn screen-share">
        {isScreenSharing ? "Stop Screen Share" : "Share Screen"}
      </button>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: isRecording ? "red" : "green",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginBottom: "10px",
        }}
      >
        {isRecording ? "Stop Recording" : "Start Recording"}
      </button>

      {recordingUrl && (
        <div>
          <h3>Recorded Video:</h3>
          <video controls src={recordingUrl} width="600"></video>
          <br />
          <a href={recordingUrl} download="screen-recording.webm">
            <button
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "blue",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Download Recording
            </button>
          </a>
        </div>
      )}
    </div>


</div>
  
  </div>
  </>
  );
}

export default VideoCall; 