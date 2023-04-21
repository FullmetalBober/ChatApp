import { ViewIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { ChatState } from '../../Context/ChatProvider';
import { useState } from 'react';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';
import axios, { AxiosError } from 'axios';
import UserListItem from '../UserAvatar/UserListItem';

const UpdateGroupChatModal = ({
  fetchAgain,
  setFetchAgain,
  fetchMessages,
}: any) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState<string>();
  const [search, setSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [renameLoading, setRenameLoading] = useState<boolean>(false);

  const toast = useToast();

  const { selectedChat, setSelectedChat, user } = ChatState();

  const handleAddUser = async (userAdd: any) => {
    if (selectedChat.users.find((u: any) => u._id === userAdd._id)) {
      toast({
        title: 'User already added',
        description: 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom-left',
      });
      return;
    }

    if (selectedChat.groupAdmin._id !== user?._id) {
      toast({
        title: 'You are not the admin',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
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

      const { data } = await axios.put(
        '/api/chats/group-add',
        {
          chatId: selectedChat._id,
          userId: userAdd._id,
        },
        config
      );

      setSelectedChat(data.data);
      setFetchAgain(!fetchAgain);
      setLoading(false);
    } catch (error) {
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

  const handleRemove = async (userRemoved: any) => {
    if (
      selectedChat.groupAdmin._id !== user?._id &&
      userRemoved._id !== user?._id
    ) {
      toast({
        title: 'You are not the admin',
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
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

      const { data } = await axios.put(
        '/api/chats/group-remove',
        {
          chatId: selectedChat._id,
          userId: userRemoved._id,
        },
        config
      );

      userRemoved._id === user?._id
        ? setSelectedChat(null)
        : setSelectedChat(data.data);
      setFetchAgain(!fetchAgain);
      fetchMessages();
      setLoading(false);
    } catch (error) {
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

  const handleRename = async () => {
    if (!groupChatName) return;

    try {
      setRenameLoading(true);

      const config = {
        headers: {
          withCredentials: true,
        },
      };

      const { data } = await axios.put(
        '/api/chats/rename',
        {
          chatId: selectedChat._id,
          chatName: groupChatName,
        },
        config
      );

      setSelectedChat(data.data);
      setFetchAgain(!fetchAgain);
      setRenameLoading(false);
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
      setRenameLoading(false);
    }

    setGroupChatName('');
  };

  const handleSearch = async (query: string) => {
    setSearch(query);
    if (!query) return;

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
      setLoading(false);
    }
  };

  return (
    <>
      <IconButton
        display={{ base: 'flex' }}
        colorScheme="whiteAlpha"
        bg="#535669"
        icon={<ViewIcon />}
        onClick={onOpen}
        aria-label="view"
      />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent bg="#44475a" color="#f8f8f2">
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            {selectedChat.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box w="100%" display="flex" flexWrap="wrap" pb={3}>
              {selectedChat.users.map((user: any) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleRemove(user)}
                />
              ))}
            </Box>
            <FormControl display="flex">
              <Input
                placeholder="Chat Name"
                mb={3}
                borderColor="#6272a4"
                focusBorderColor="#6272a4"
                value={groupChatName}
                onChange={e => setGroupChatName(e.target.value)}
              />
              <Button
                variant="solid"
                colorScheme="teal"
                ml={1}
                isLoading={renameLoading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add User to group"
                mb={1}
                borderColor="#6272a4"
                focusBorderColor="#6272a4"
                onChange={e => handleSearch(e.target.value)}
              />
            </FormControl>
            {loading ? (
              <Spinner size="lg" />
            ) : (
              searchResults.map((user: any) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                />
              ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button onClick={() => handleRemove(user)} colorScheme="red">
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
