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
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
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
            <MenuList pl={2}>
              {!notifications.length && 'No new messages'}
              {notifications.map((notification: any) => (
                <MenuItem
                  key={notification._id}
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
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user?.name}
                src={user?.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      <Drawer placement="left" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" pb={2}>
              <Input
                placeholder="Search by name or email"
                mr={2}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              <Button onClick={handleSearch}>Go</Button>
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
