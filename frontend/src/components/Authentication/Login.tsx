import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
} from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';

const Login = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [show, setShow] = useState<boolean>(false);
  const [email, setEmail] = useState<string>();
  const [password, setPassword] = useState<string>();
  const toast = useToast();
  const navigate = useNavigate();

  const handleClick = () => setShow(!show);

  const submitHandler = async () => {
    setLoading(true);
    if (!email || !password) {
      toast({
        title: 'Please fill all the fields',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'bottom',
      });
      setLoading(false);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/users/login',
        { email, password },
        config
      );

      const cookies = new Cookies();
      cookies.set('userInfo', data.data, {
        path: '/',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      setLoading(false);
      navigate('/chats');
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

  return (
    <VStack spacing="5px">
      <FormControl id="email_login" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          placeholder="Enter Your Email"
          borderColor="#6272a4"
          focusBorderColor="#6272a4"
          onChange={e => setEmail(e.target.value)}
        />
      </FormControl>

      <FormControl id="password_login" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? 'text' : 'password'}
            placeholder="Enter Your Password"
            borderColor="#6272a4"
            focusBorderColor="#6272a4"
            onChange={e => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              colorScheme="whiteAlpha"
              bg="transparent"
              onClick={handleClick}
            >
              {show ? 'Hide' : 'Show'}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      <Button
        colorScheme="facebook"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Login
      </Button>
    </VStack>
  );
};

export default Login;
