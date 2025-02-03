import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components';
import Contacts from '../components/Contacts';
import { allUsersRoute ,host} from '../utils/APIRoutes';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import { io } from "socket.io-client";
import background from '../assets/bg.webp'

const Chat = () => {
  const navigate = useNavigate();
  const socket = useRef();
  const [contacts,setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);

    useEffect(() => {
        const fatch = async ()=>{
          if (!localStorage.getItem("chat-app-user"))
            navigate("/login");
          else{
            const currUser = await JSON.parse(localStorage.getItem("chat-app-user"));
            console.log(currUser);
            setCurrentUser(currUser);
          }
        }
        fatch();
    }, []);

    useEffect(()=>{
      if(currentUser){
        socket.current = io(host);
        socket.current.emit("add-user",currentUser._id);
      }
    },[currentUser]);
    useEffect(()=>{
        const fatchUsers = async ()=>{
            if(currentUser.isAvatarImageSet){
              const {data} = await axios.get(`${allUsersRoute}/${currentUser._id}`);
              console.log(data);
              setContacts(data);
            }
            else
            navigate("/setAvatar");
        }
        if(currentUser)
          fatchUsers();
    },[currentUser]);

    const handleChatChange = (chat)=>{
      setCurrentChat(chat);
    }

    
  return (
    <Container className='chat'>
      <div className='container'>
          <Contacts 
           contacts={contacts}
           changeChat={handleChatChange}
           currentUser = {currentUser}
           socket = {socket}
           />
          {
            !currentChat ? 
            <Welcome currentUser={currentUser}/>:
            <ChatContainer currentChat={currentChat} currentUser = {currentUser} socket={socket}/>
          }
      </div>
    </Container>
  )
}

const Container = styled.div`
   height:100vh;
   width:100vw;
   display: flex;
   flex-direction: column;
   justify-content: center;
   gap: 1rem;
   align-items: center;
   background-color: #131324;
   .container{
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width:1080px){
      grid-template-columns: 35% 65%;
    }
   }
`;

export default Chat