import {
  Avatar,
  Box,
  Button,
  Drawer,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text,
  Tooltip,
  useDisclosure,
  DrawerBody,
  Input,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { BellIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { useState } from 'react';
import { ChatState } from '../../Context/ChatProvider';
import ProfileModal from './ProfileModal';
import Cookies from 'universal-cookie';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import ChatLoading from '../ChatLoading';
import UserListItem from '../UserAvatar/UserListItem';
import { getSender } from '../../config/ChatLogics';
import NotificationBadge from 'react-notification-badge';
import { Effect } from 'react-notification-badge';

const SideDrawer = () => {
  const [search, setSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingChat, setLoadingChat] = useState<boolean>();

  const {
    user,
    setSelectedChat,
    chats,
    setChats,
    notifications,
    setNotifications,
  } = ChatState();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cookies = new Cookies();

  const logoutHandler = () => {
    cookies.set('userInfo', 'logout', {
      path: '/',
      expires: new Date(Date.now()),
    });
    try {
      axios.get('/api/users/logout');
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
        position: 'bottom',
      });
    }
    navigate('/');
  };

  const toast = useToast();

  const handleSearch = async () => {
    if (!search) {
      toast({
        title: 'Please enter something to search',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-left',
      });
      return;
    }
    try {
      setLoading(true);

      const config = {
        headers: {
          withCredentials: true,
        },
      };

      const { data } = await axios.get(`/api/users?search=${search}`, config);

      setSearchResults(data.data.data);
      setLoading(false);
    } catch (error) {
      console.log(error);
      let errorMessage = 'Something went wrong';
      if (error instanceof AxiosError)
        errorMessage = error.response?.data.message;
      toast({
        title: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      setLoading(false);
    }
  };

  const accessChat = async (userId: string) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          withCredentials: true,
          'Content-type': 'application/json',
        },
      };

      const { data } = await axios.post('/api/chats', { userId }, config);

      if (!chats.find((c: any) => c._id === data.data._id))
        setChats([data.data, ...chats]);

      setSelectedChat(data.data);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      console.log(error);
      let errorMessage = 'Something went wrong';
      if (error instanceof AxiosError)
        errorMessage = error.response?.data.message;
      toast({
        title: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });

      setLoadingChat(false);
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="#44475a"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
        borderColor="#282a36"
        borderRadius="lg"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button colorScheme="whiteAlpha" bg="transparent" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: 'none', md: 'flex' }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans">
          Chat App
        </Text>
        <div>
          <Menu>
            <MenuButton p={1}>
              <NotificationBadge
                count={notifications.length}
                effect={Effect.SCALE}
              />
              <BellIcon fontSize="2xl" m={1} />
            </MenuButton>
            <MenuList ml={2} bg="#6c6f86" borderColor="#6272a4">
              {!notifications.length && (
                <Text textAlign="center">No new messages</Text>
              )}
              {notifications.map((notification: any) => (
                <MenuItem
                  key={notification._id}
                  bg="#6c6f86"
                  _hover={{ bg: '#a0a3b1' }}
                  onClick={() => {
                    setSelectedChat(notification.chat);
                    setNotifications(
                      notifications.filter((n: any) => n !== notification)
                    );
                  }}
                >
                  {notification.chat.isGroupChat
                    ? `New Message in ${notification.chat.chatName}`
                    : `New Message from ${getSender(
                        user,
                        notification.chat.users
                      )}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              colorScheme="whiteAlpha"
              bg="transparent"
            >
              <Avatar
                size="sm"
                cursor="pointer"
                name={user?.name}
                src={user?.pic}
              />
            </MenuButton>
            <MenuList bg="#6c6f86" borderColor="#6272a4">
              <ProfileModal user={user}>
                <MenuItem bg="#6c6f86" _hover={{ bg: '#a0a3b1' }}>
                  My Profile
                </MenuItem>
              </ProfileModal>
              <MenuDivider borderColor="#dcdcdc" />
              <MenuItem
                bg="#6c6f86"
                _hover={{ bg: '#a0a3b1' }}
                onClick={logoutHandler}
              >
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="#44475a" color="#f8f8f2">
          <DrawerHeader borderBottomWidth="1px" borderColor="#dcdcdc">
            Search Users
          </DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                borderColor="#6272a4"
                focusBorderColor="#6272a4"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Button
                colorScheme="whiteAlpha"
                bg="#535669"
                onClick={handleSearch}
              >
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResults?.map((user: any) => (
                <UserListItem
                  key={user?._id}
                  user={user}
                  handleFunction={() => accessChat(user?._id)}
                />
              ))
            )}
            {loadingChat && <Spinner ml="auto" display="flex" />}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default SideDrawer;
