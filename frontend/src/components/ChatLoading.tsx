import { Skeleton, Stack } from '@chakra-ui/react';

const ChatLoading = () => {
  const skeletons = [];
  for (let i = 0; i < 11; i++) {
    skeletons.push(<Skeleton key={i} height="45px" />);
  }

  return <Stack>{skeletons}</Stack>;
};

export default ChatLoading;
