// src/pages/Signup.jsx
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

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <Flex minH="100vh" bg="gray.900">

      {/* LEFT PANEL WITH LOGO */}
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
          Create Your Account
        </Heading>

        <Text fontSize="lg" textAlign="center" color="gray.300" maxW="80%">
          Join Vistaro and unlock premium events, shows & exclusive experiences.
        </Text>
      </Flex>

      {/* RIGHT PANEL – SIGNUP FORM */}
      <Flex flex="1" align="center" justify="center" p={10} bg="gray.850">
        <Box
          w={{ base: "100%", sm: "420px" }}
          p={8}
          bg="gray.800"
          borderRadius="xl"
          boxShadow="2xl"
        >
          <Heading mb={4} textAlign="center" color="white">
            Sign Up
          </Heading>

          <VStack spacing={4}>

            {/* Name */}
            <FormControl>
              <FormLabel color="gray.300">Full Name</FormLabel>
              <Input type="text" placeholder="John Doe" bg="gray.700" border="none" color="white" />
            </FormControl>

            {/* Email */}
            <FormControl>
              <FormLabel color="gray.300">Email</FormLabel>
              <Input type="email" placeholder="you@example.com" bg="gray.700" border="none" color="white" />
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
                  <Button size="sm" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {/* Confirm Password */}
            <FormControl>
              <FormLabel color="gray.300">Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  bg="gray.700"
                  border="none"
                  color="white"
                />
                <InputRightElement width="4.5rem">
                  <Button size="sm" onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button colorScheme="teal" w="100%" mt={3}>
              Create Account
            </Button>

            <Text color="gray.300" fontSize="sm">
              Already have an account?{" "}
              <Link as={RouterLink} to="/login" color="teal.300">
                Login
              </Link>
            </Text>
          </VStack>
        </Box>
      </Flex>
    </Flex>
  );
}
