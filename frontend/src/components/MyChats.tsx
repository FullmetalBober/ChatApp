import { useState, useEffect, useCallback } from 'react';
import { ChatState } from '../Context/ChatProvider';
import { Box, Button, Stack, Text, useToast } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import Cookies from 'universal-cookie';
import { AddIcon } from '@chakra-ui/icons';
import ChatLoading from './ChatLoading';
import { getSender } from '../config/ChatLogics';
import GroupChatModal from './miscellaneous/GroupChatModal';

const MyChats = ({ fetchAgain }: any) => {
  const [loggedUser, setLoggedUser] = useState<any>();
  const { selectedChat, setSelectedChat, chats, setChats } = ChatState();

  const toast = useToast();

  const fetchChats = useCallback(async () => {
    try {
      const config = {
        headers: {
          withCredentials: true,
        },
      };

      const { data } = await axios.get('/api/chats', config);
      setChats(data.data);
    } catch (error) {
      let errorMessage = 'Something went wrong';
      if (error instanceof AxiosError)
        errorMessage = error.response?.data.message;
      toast({
        title: errorMessage,
        description: 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
    }
  }, [toast, setChats]);

  useEffect(() => {
    const cookies = new Cookies();
    setLoggedUser(cookies.get('userInfo').user);
    fetchChats();
  }, [fetchAgain, fetchChats]);

  return (
    <Box
      display={{ base: selectedChat ? 'none' : 'flex', md: 'flex' }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      w={{ base: '100%', md: '31%' }}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        pb={3}
        px={3}
        fontSize={{ base: '28px', md: '30px' }}
        fontFamily="Work sans"
        display="flex"
        w="100%"
        justifyContent="space-between"
        alignItems="center"
      >
        My Chats
        <GroupChatModal>
          <Button
            display="flex"
            fontSize={{ base: '17px', md: '10px', lg: '17px' }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        display="flex"
        flexDir="column"
        p={3}
        bg="#F8F8F8"
        w="100%"
        h="100%"
        borderRadius="lg"
        overflowY="hidden"
      >
        {chats ? (
          <Stack overflowY="scroll">
            {chats.map((chat: any) => (
              <Box
                onClick={() => setSelectedChat(chat)}
                cursor="pointer"
                bg={selectedChat === chat ? '#38B2AC' : '#E8E8E8'}
                color={selectedChat === chat ? 'white' : 'black'}
                px={3}
                py={2}
                borderRadius="lg"
                key={chat._id}
              >
                <Text>
                  {!chat.isGroupChat
                    ? getSender(loggedUser, chat.users)
                    : chat.chatName}
                </Text>
              </Box>
            ))}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
