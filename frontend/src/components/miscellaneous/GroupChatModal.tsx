import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useState } from 'react';
import { ChatState } from '../../Context/ChatProvider';
import axios, { AxiosError } from 'axios';
import UserListItem from '../UserAvatar/UserListItem';
import UserBadgeItem from '../UserAvatar/UserBadgeItem';

const GroupChatModal = ({ children }: any) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [groupChatName, setGroupChatName] = useState<string>();
  const [selectedUsers, setSelectedUsers] = useState<any>([]);
  const [search, setSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const toast = useToast();

  const { chats, setChats } = ChatState();

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
      setSearchResults(data.data);
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

  const handleSubmit = async () => {
    if (!groupChatName || !selectedUsers) {
      toast({
        title: 'Please fill all fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    try {
      const config = {
        headers: {
          withCredentials: true,
        },
      };

      const { data } = await axios.post(
        '/api/chats/group',
        {
          name: groupChatName,
          users: selectedUsers.map((user: any) => user._id),
        },
        config
      );

      setChats([data.data, ...chats]);
      onClose();
      toast({
        title: 'Group created',
        status: 'success',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
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
  };

  const handleDelete = (delUser: any) => {
    setSelectedUsers(
      selectedUsers.filter((sel: any) => sel._id !== delUser._id)
    );
  };

  const handleGroup = (userToAdd: any) => {
    if (selectedUsers.includes(userToAdd)) {
      toast({
        title: 'User already added',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top',
      });
      return;
    }

    setSelectedUsers([...selectedUsers, userToAdd]);
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="#44475a" color="#f8f8f2">
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display="flex"
            justifyContent="center"
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody display="flex" flexDir="column" alignItems="center">
            <FormControl>
              <Input
                placeholder="Chat Name"
                mb={3}
                borderColor="#6272a4"
                focusBorderColor="#6272a4"
                onChange={e => setGroupChatName(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <Input
                placeholder="Add Users"
                mb={1}
                borderColor="#6272a4"
                focusBorderColor="#6272a4"
                onChange={e => handleSearch(e.target.value)}
              />
            </FormControl>
            <Box w="100%" display="flex" flexWrap="wrap">
              {selectedUsers.map((user: any) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => handleDelete(user)}
                />
              ))}
            </Box>

            {loading ? (
              <div>loading</div>
            ) : (
              searchResults
                ?.slice(0, 4)
                .map((user: any) => (
                  <UserListItem
                    key={user._id}
                    user={user}
                    handleFunction={() => handleGroup(user)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Created Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default GroupChatModal;
