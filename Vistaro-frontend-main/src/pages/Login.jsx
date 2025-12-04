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
  useToast,
} from "@chakra-ui/react";
import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { loginUser } from "../apis/AuthApi";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { setCity } from "../redux/citySlice";


export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      toast.warning("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        email: form.email.trim(),
        password: form.password,
      };

      const res = await loginUser(payload);

      // backend: { token, email, role, userId }
      const auth = res.data;
      dispatch(setUser(auth));
      dispatch(setCity(auth.city? auth.city : ""));
      toast.success("Logged in successfully.");

      navigate("/"); // go home after login
    } catch (err) {
      console.error("Login failed:", err);
      const msg =
        err?.response?.status === 401
          ? "Invalid email or password."
          : err?.response?.data?.message ||
          err?.response?.data ||
          "Login failed. Please try again.";

      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

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
        <Image src="/Logo-final-2.png" alt="Vistaro Logo" w="260px" mb={4} />

        <Heading fontSize="3xl" textAlign="center">
          Welcome Back
        </Heading>

        <Text fontSize="lg" textAlign="center" color="gray.300" maxW="80%">
          Log in to continue discovering events, concerts, movies & unforgettable
          experiences.
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
                name="email"
                type="email"
                placeholder="you@example.com"
                bg="gray.700"
                border="none"
                color="white"
                value={form.email}
                onChange={handleChange}
              />
            </FormControl>

            {/* Password */}
            <FormControl>
              <FormLabel color="gray.300">Password</FormLabel>
              <InputGroup>
                <Input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  bg="gray.700"
                  border="none"
                  color="white"
                  value={form.password}
                  onChange={handleChange}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    size="sm"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            {/* Button */}
            <Button
              colorScheme="teal"
              w="100%"
              mt={3}
              onClick={handleLogin}
              isLoading={loading}
            >
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
