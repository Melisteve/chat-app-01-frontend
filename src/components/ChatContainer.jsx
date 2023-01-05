import React, {useState, useEffect, useRef} from 'react'
import styled from 'styled-components'
import ChatInput from './ChatInput';
import Logout from './Logout';
import {v4 as uuidv4} from "uuid"
import axios from 'axios'
import { getAllMessagesRoute, sendMessageRoute } from '../utils/APIRoutes';

const ChatContainer = ({currentChat, currentUser, socket}) => {

  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null)
  const scrollRef = useRef();
  
  useEffect(() => {
    (async() => {
      if(currentChat){

        const response = await axios.post(getAllMessagesRoute,{
          from: currentUser._id,
          to:currentChat._id,
        })
        //console.log(response);
        setMessages(response.data)
      }
    })();
  },[currentChat])

const handleSendMsg = async (msg) =>{
   await axios.post(sendMessageRoute, {
        from: currentUser._id,
        to:currentChat._id,
        message: msg ,
    })
   socket.current.emit("send-msg", {
    to: currentChat._id,
    from: currentUser._id,
    message: msg,
   })

   const msgs = [...messages]
   msgs.push({fromSelf: true, message: msg})
   setMessages(msgs);
};

useEffect(() => {
  if(socket.current){
    socket.current.on("msg-recieve", (msg) => {
      setArrivalMessage({ fromSelf: false, message: msg });
    })
  }
},[])

useEffect(() => {
   arrivalMessage && setMessages((prev) => [...prev, arrivalMessage])
},[arrivalMessage])


useEffect(() => {
  scrollRef.current?.scrollIntoView({ behavior: "smooth" });
}, [messages]);
  
  return (
    
    <Container>
        <div className="chat-header">
            <div className="user-details">
                <div className="avatar">
                <img
              src={`data:image/svg+xml;base64,${currentChat.avatarImage}`}
              alt="avatar"
            />
                </div>
                <div className="username">
                    <h3>{currentChat.username}</h3>
                </div>
            </div>
            <Logout/>
        </div>
        <div className="chat-messages">
             {
              messages.map((message) => { 
                
                return(
                  <div  ref={scrollRef} key={uuidv4()}>
                     <div className={`message ${message.fromSelf ? "sended" : "recieved"}`}>
                      <div className="content">
                        <p>{message.message}</p>
                      </div>
                     </div>
                  </div>
                )
              })
             }
        </div>
        <ChatInput handleSendMsg={handleSendMsg}/>
    </Container>
  )
}

const Container = styled.div`
  display: grid;
  grid-template-rows: 10% 80% 10%;
  gap: 0.1rem;
  overflow: hidden;
  @media only screen and (max-width: 769px) {
    grid-template-rows: 15% 70% 15%;
  }
  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    @media only screen and (max-width: 769px) {
           padding: 0 1rem;
        }
    .user-details {
      display: flex;
      align-items: center;
      gap: 1rem;
      @media only screen and (max-width: 769px){
          gap: 0.3rem;
        }
      .avatar {
        img {
          height: 3rem;
        }
        @media only screen and (max-width: 769px)  {
             img {
             height: 2rem;
            }
        }
      }
      .username {
                h3 {
             color: white;
            }
            @media only screen and (max-width: 769px)  {
              h3 {
               font-size: 0.9rem;
            }
        }
      }
    }
  }
  .chat-messages {
    padding: 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    overflow: auto;
    &::-webkit-scrollbar {
      width: 0.2rem;
      &-thumb {
        background-color: #ffffff39;
        width: 0.1rem;
        border-radius: 1rem;
      }
    }

    @media only screen and (max-width: 769px)  {
           padding: 0.3rem 0.8rem;
           gap: 0.4rem;
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
        @media only screen and (max-width: 769px)  {
          max-width: 70%;
          font-size: 0.9rem;
          padding: 0.7rem;
        }
      }
    }
    .sended {
      justify-content: flex-end;
      .content {
        background-color: #14cc111f;
      }
    }
    .recieved {
      justify-content: flex-start;
      .content {
        background-color: #6e5206;
      }
    }
    
  }
`;


export default ChatContainer
