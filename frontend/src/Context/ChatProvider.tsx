import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

interface IChatProviderProps {
  children: React.ReactNode;
}

interface IUser {
  _id: string;
  name: string;
  email: string;
  password: string;
  pic: string;
}

interface IChatContext {
  user: IUser | undefined;
  setUser: React.Dispatch<React.SetStateAction<IUser | undefined>>;
  selectedChat: any;
  setSelectedChat: React.Dispatch<any>;
  chats: any;
  setChats: React.Dispatch<any>;
  notifications: any;
  setNotifications: React.Dispatch<any>;
}

const ChatContext = createContext<IChatContext>({} as IChatContext);

const ChatProvider = ({ children }: IChatProviderProps) => {
  const [user, setUser] = useState<IUser>();
  const [selectedChat, setSelectedChat] = useState<any>();
  const [chats, setChats] = useState<any>([]);
  const [notifications, setNotifications] = useState<any>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const cookies = new Cookies();
    const userInfo: any | undefined = cookies.get('userInfo');
    if (userInfo) {
      setUser(userInfo.user);
    } else {
      navigate('/');
    }
  }, [navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectedChat,
        setSelectedChat,
        chats,
        setChats,
        notifications,
        setNotifications,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const ChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
