import { Avatar, Box, Text } from '@chakra-ui/react';

const UserListItem = ({ user, handleFunction }: any) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      bg="#535669"
      _hover={{
        background: '#717284',
      }}
      w="100%"
      display="flex"
      alignContent="center"
      px={3}
      py={2}
      mb={2}
      borderRadius="lg"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user?.name}
        src={user?.pic}
      />
      <Box>
        <Text>{user?.name}</Text>
        <Text fontSize="xs">
          <b>Email : </b> {user?.email}
        </Text>
      </Box>
    </Box>
  );
};

export default UserListItem;
