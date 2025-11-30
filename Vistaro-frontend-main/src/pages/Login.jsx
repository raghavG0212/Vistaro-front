// src/pages/Login.jsx
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Text,
  Link,
  VStack,
  InputGroup,
  InputRightElement,
  Image,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Flex minH="100vh" bg="gray.900">

      {/* LEFT PANEL WITH LOGO + TEXT */}
      <Flex
        flex="1"
        bg="gray.800"
        color="white"
        direction="column"
        align="center"
        justify="center"
        px={10}
        gap={6}
        display={{ base: "none", md: "flex" }}
        boxShadow="xl"
      >
        <Image
          src="/Logo-final-2.png"
          alt="Vistaro Logo"
          w="260px"
          mb={4}
        />

        <Heading fontSize="3xl" textAlign="center">
          Welcome Back
        </Heading>

        <Text fontSize="lg" textAlign="center" color="gray.300" maxW="80%">
          Log in to continue discovering events, concerts, movies & unforgettable experiences.
        </Text>
      </Flex>

      {/* RIGHT PANEL – LOGIN FORM */}
      <Flex flex="1" align="center" justify="center" p={10} bg="gray.850">
        <Box
          w={{ base: "100%", sm: "380px" }}
          p={8}
          bg="gray.800"
          borderRadius="xl"
          boxShadow="2xl"
        >
          <Heading mb={4} textAlign="center" color="white">
            Login
          </Heading>

          <VStack spacing={4}>
            {/* Email */}
            <FormControl>
              <FormLabel color="gray.300">Email</FormLabel>
              <Input
                type="email"
                placeholder="you@example.com"
                bg="gray.700"
                border="none"
                color="white"
              />
            </FormControl>

            {/* Password */}
            <FormControl>
              <FormLabel color="gray.300">Password</FormLabel>
              <InputGroup>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  bg="gray.700"
                  border="none"
                  color="white"
                />
                <InputRightElement width="4.5rem">
                  <Button
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {/* Button */}
            <Button colorScheme="teal" w="100%" mt={3}>
              Login
            </Button>

            {/* Link */}
            <Text color="gray.300" fontSize="sm">
              Don't have an account?{" "}
              <Link as={RouterLink} to="/signup" color="teal.300">
                Sign Up
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}
