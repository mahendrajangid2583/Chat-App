import React, { useEffect, useState } from 'react'
import robot from '../assets/robot.gif';
import styled from 'styled-components';

const Welcome = ({currentUser}) => {
    const [userName,setUserName] = useState("");
     useEffect(() => {
        
          if(currentUser){
            setUserName(currentUser.username);
            
          }
       
      }, [currentUser]);
  return (
    <Container >
        <img src={robot} alt='welcome'/>
        <h1>
        Welcome, <span>{userName}!</span>
        </h1>
        <h3>Please select a chat to Start messaging.</h3>
    </Container>
  )
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  color: white;
  flex-direction: column;
  img{
    height: 20rem;
  }
  span{
    color: #4e0eff;
  }

`;

export default Welcome;