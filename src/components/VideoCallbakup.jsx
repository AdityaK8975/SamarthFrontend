import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import AgoraRTC from "agora-rtc-sdk-ng";

const APP_ID = "d59df11bf39f4acb8d49ab9e6ab2cd76"; // Replace with your Agora App ID
const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

function VideoCall() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const [localTracks, setLocalTracks] = useState([]);
  const [remoteUsers, setRemoteUsers] = useState({});
  const [channel, setChannel] = useState("");
  const [micEnabled, setMicEnabled] = useState(true); // Default to enabled
  const [videoEnabled, setVideoEnabled] = useState(true); // Default to enabled
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!roomId) {
      alert("Invalid Room ID");
      return;
    }

    const joinMeeting = async () => {
      try {
        // Fetch token from the server
        const response = await fetch(`https://samarthmeet.onrender.com/token?channel=${roomId}`);
        const data = await response.json();
        if (!data.token) throw new Error("Token generation failed");

        const token = data.token;
        const uid = data.uid;
        setChannel(data.channelName);
        console.log("Generated Channel Name:", channel);

        // Join the Agora channel
        await client.join(APP_ID, roomId, token, uid);

        // Create local tracks (audio + video)
        const tracks = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalTracks(tracks);
        tracks[1].play("local-player");

        // Publish local tracks to the channel
        await client.publish(tracks);

        // Subscribe to all existing users
        client.remoteUsers.forEach(async (user) => {
          await subscribeToUser(user);
        });

        // Listen for new users publishing their tracks
        client.on("user-published", async (user, mediaType) => {
          console.log("User published:", user.uid);
          
          await client.subscribe(user, mediaType);
          console.log(`Subscribed to ${user.uid}`);
        
          if (mediaType === "video") {
            const remoteVideoTrack = user.videoTrack;
        
            // Ensure container exists
            let player = document.getElementById(`user-${user.uid}`);
            if (!player) {
              player = document.createElement("div");
              player.id = `user-${user.uid}`;
              player.style.width = "250px";
              player.style.height = "250px";
              document.getElementById("remote-container").appendChild(player);
            }
        
            remoteVideoTrack.play(`user-${user.uid}`);
          }
        
          if (mediaType === "audio") {
            user.audioTrack.play();
          }
        });

        
        client.on("user-joined", async (user) => {
          console.log("User joined:", user.uid);
          const existingUsers = client.remoteUsers;
          
          existingUsers.forEach(async (remoteUser) => {
            await client.subscribe(remoteUser, "video");
            const remoteVideoTrack = remoteUser.videoTrack;
            if (remoteVideoTrack) {
              const player = document.createElement("div");
              player.id = `user-${remoteUser.uid}`;
              document.getElementById("video-container").appendChild(player);
              remoteVideoTrack.play(`user-${remoteUser.uid}`);
            }
          });
        });
        

        // Handle when a user leaves
        client.on("user-unpublished", (user) => {
          removeUser(user.uid);
        });

        client.on("user-left", (user) => {
          removeUser(user.uid);
        });

      } catch (error) {
        console.error("Failed to join meeting:", error);
      }
    };

    joinMeeting();

    return () => {
      client.leave();
      localTracks.forEach(track => track.close());
    };
  }, [roomId]);

  // Subscribe to a remote user
  const subscribeToUser = async (user) => {
    // Ensure that the user has a video track and subscribe to it
    if (user.hasVideo) {
      try {
        await client.subscribe(user, "video");
        const remoteVideoTrack = user.videoTrack;
        const videoContainer = document.createElement("div");
        videoContainer.id = `user-${user.uid}`;
        videoContainer.style.width = "400px";
        videoContainer.style.height = "250px";
        document.getElementById("remote-container").appendChild(videoContainer);
        
        if (remoteVideoTrack) {
          remoteVideoTrack.play(videoContainer);
        } else {
          console.error("Remote video track is not available.");
        }
      } catch (err) {
        console.error("Error subscribing to video:", err);
      }
    } else {
      // If no video track is available, display UID or a black screen
      const videoContainer = document.createElement("div");
      videoContainer.id = `user-${user.uid}`;
      videoContainer.style.width = "200px";
      videoContainer.style.height = "150px";
      videoContainer.style.background = "black";
      videoContainer.innerText = "User UID: " + user.uid;
      document.getElementById("remote-container").appendChild(videoContainer);
    }
  
    // Ensure that the user has an audio track and subscribe to it
    if (user.hasAudio) {
      try {
        await client.subscribe(user, "audio");
        const audioTrack = user.audioTrack;
        if (audioTrack) {
          audioTrack.play();
        } else {
          console.error("Remote audio track is not available.");
        }
      } catch (err) {
        console.error("Error subscribing to audio:", err);
      }
    }
  };
  

  // Remove a user when they leave
  const removeUser = (uid) => {
    setRemoteUsers((prevUsers) => {
      const updatedUsers = { ...prevUsers };
      delete updatedUsers[uid];
      return updatedUsers;
    });

    const videoContainer = document.getElementById(`user-${uid}`);
    if (videoContainer) {
      videoContainer.remove();
    }
  };
 

  const toggleMic = async () => {
    if (localTracks[0]) {
      await localTracks[0].setEnabled(!micEnabled);
      setMicEnabled(!micEnabled);
    }
  };
  
  const toggleVideo = async () => {
    if (localTracks[1]) {
      await localTracks[1].setEnabled(!videoEnabled);
      setVideoEnabled(!videoEnabled);
    }
  };
  
  // Leave the meeting
  const leaveMeeting = async () => {
    await client.leave();
    localTracks.forEach(track => track.close());
    navigate("/"); // Redirect to home or another page after leaving
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
  

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Agora Video Call</h2>
      <h3>Joined on {channel}</h3>

      <div id="video-container" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        <div id="local-player" style={{ width: "250px", height: "250px", background: "black", margin: "20px", justifyContent:"left",color:"white" }}>You</div>
        <div id="remote-container" style={{ display: "flex", flexWrap: "wrap" }}></div>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button 
          onClick={toggleMic} 
          style={{ margin: "10px", padding: "10px", fontSize: "16px", background: micEnabled ? "green" : "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          {micEnabled ? "Mute Mic" : "Unmute Mic"}
        </button>

        <button 
          onClick={toggleVideo} 
          style={{ margin: "10px", padding: "10px", fontSize: "16px", background: videoEnabled ? "green" : "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          {videoEnabled ? "Turn Video Off" : "Turn Video On"}
        </button>

        <button 
          onClick={leaveMeeting} 
          style={{ margin: "10px", padding: "10px", fontSize: "16px", background: "red", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
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
          }}>
          {isScreenSharing ? "Stop Screen Share" : "Share Screen"}
        </button>

      </div>
    </div>
  );
}

export default VideoCall;
