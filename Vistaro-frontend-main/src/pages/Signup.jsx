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
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { signupUser } from "../apis/AuthApi"; // adjust path if needed
import { toast } from "react-toastify";

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    confirmPassword: "",
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.city.trim() ||
      !form.password.trim()
    ) {
      toast.warning("Please fill all required fields.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        password: form.password,
        city: form.city.trim(),
        // role: "USER" // backend already defaults to USER
      };

      await signupUser(payload);

      // IMPORTANT: do NOT store token here, force login flow
      // Clear any stale auth if present
      localStorage.removeItem("token");
      localStorage.removeItem("vistaroAuth");

      toast.success("Account created successfully.");

      navigate("/login");
    } catch (err) {
      console.error("Signup failed:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Signup failed. Please try again.";

      toast.error("Signup failed");
    } finally {
      setLoading(false);
    }
  };

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
        <Image src="/Logo-final-2.png" alt="Vistaro Logo" w="260px" mb={4} />

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
              <Input
                name="name"
                type="text"
                placeholder="John Doe"
                bg="gray.700"
                border="none"
                color="white"
                value={form.name}
                onChange={handleChange}
              />
            </FormControl>

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

            {/* Phone (optional) */}
            <FormControl>
              <FormLabel color="gray.300">Phone (optional)</FormLabel>
              <Input
                name="phone"
                type="text"
                placeholder="9876543210"
                bg="gray.700"
                border="none"
                color="white"
                value={form.phone}
                onChange={handleChange}
              />
            </FormControl>

            {/* City */}
            <FormControl>
              <FormLabel color="gray.300">City</FormLabel>
              <Input
                name="city"
                type="text"
                placeholder="Bengaluru"
                bg="gray.700"
                border="none"
                color="white"
                value={form.city}
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

            {/* Confirm Password */}
            <FormControl>
              <FormLabel color="gray.300">Confirm Password</FormLabel>
              <InputGroup>
                <Input
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter password"
                  bg="gray.700"
                  border="none"
                  color="white"
                  value={form.confirmPassword}
                  onChange={handleChange}
                />
                <InputRightElement width="4.5rem">
                  <Button
                    size="sm"
                    onClick={() => setShowConfirm((prev) => !prev)}
                  >
                    {showConfirm ? "Hide" : "Show"}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              colorScheme="teal"
              w="100%"
              mt={3}
              onClick={handleSignup}
              isLoading={loading}
            >
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
