import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import Logout from "./Logout";
import ChatInput from "./ChatInput";
import { sendMessageRoute, recieveMessageRoute } from "../utils/APIRoutes";
import axios from "axios";

const ChatContainer = ({ currentChat, currentUser, socket }) => {
  const scrollRef = useRef();
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (socket.current && currentChat) {
      // Check if the current chat user is online
      socket.current.emit("check-online", currentChat._id);
      

      // Listen for online status updates
      socket.current.on("user-online-status", ({ userId, isOnline }) => {
        if (userId === currentChat._id) {
          setIsOnline(isOnline);
        }
        
      });

      // Listen for user online events
      socket.current.on("user-online", (userId) => {
        if (userId === currentChat._id) {
          setIsOnline(true);
        }
      });

      // Listen for user offline events
      socket.current.on("user-offline", (userId) => {
        if (userId === currentChat._id) {
          setIsOnline(false);
        }
      });
    }

    // Cleanup listeners on component unmount
    return () => {
      if (socket.current) {
        socket.current.off("user-online-status");
        socket.current.off("user-online");
        socket.current.off("user-offline");
      }
    };
  }, [currentChat, socket]);

  const handleSendMsg = async (msg) => {
    socket.current.emit("send-msg", {
      to: currentChat._id,
      from: currentUser._id,
      msg,
    });
    const { data } = await axios.post(sendMessageRoute, {
      from: currentUser._id,
      to: currentChat._id,
      message: msg,
    });
    const msgs = [...messages];
    msgs.push({ fromSelf: true, message: msg });
    setMessages(msgs);
  };

  useEffect(() => {
    const fatch = async () => {
      const { data } = await axios.post(recieveMessageRoute, {
        from: currentUser._id,
        to: currentChat._id,
      });
      
      if (data) {
        setMessages(data);
      }
    };
    fatch();
  }, [currentChat]);

  useEffect(() => {
    if (socket.current) {
      socket.current.on("msg-recieve", (msg) => {
        setArrivalMessage({ fromSelf: false, message: msg });
        console.log("msg", msg);
      });
    }
  }, []);

  useEffect(() => {
    arrivalMessage && setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage]);

  useEffect(() => {
    console.log("scroll", scrollRef);
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Container>
      <div className="chat-header">
        <div className="user-details">
          <div className="avatar">
            <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt=""
            />
          </div>
          <div className="username">
            <h3>{currentChat.username}</h3>
            <span className={`${isOnline ? "online":"offline"}`}>{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>
        <Logout socket={socket} currentUserId={currentUser._id}/>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => {
          return (
            <div key={index} ref={scrollRef}>
              <div
                className={`message ${
                  message.fromSelf ? "sended" : "recieved"
                }`}
              >
                <div className="content ">
                  <p>{message.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <ChatInput handleSendMsg={handleSendMsg} />
    </Container>
  );
};

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media screen and (min-width: 720px) and (max-width: 1080px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 2rem;
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      .avatar {
        img {
          height: 3rem;
        }
      }
      .username {
        h3 {
          color: white;
        }
        span {
          font-size: 0.8rem;
          
        }
        .online{
            color: green;
          }
          .offline{
            color: red;
          }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    gap: 1rem;
    overflow: auto;
    flex-direction: column;
    color: white;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }
    .message {
      display: flex;
      align-items: center;
      .content {
        max-width: 40%;
        overflow-wrap: break-word;
        padding: 1rem;
        font-size: 1.1rem;
        border-radius: 1rem;
        color: #d1d1d1;
        @media screen and (min-width: 720px) and (max-width: 1080px) {
          max-width: 70%;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #4f04ff21;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #9900ff20;
      }
    }
  }
`;

export default ChatContainer;