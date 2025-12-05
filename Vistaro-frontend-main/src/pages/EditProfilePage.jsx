// src/pages/EditProfilePage.jsx

import React, { useEffect, useState } from "react";
import {
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  HStack,
  Select,
  Text,
  Divider,
} from "@chakra-ui/react";
import { useSelector, useDispatch } from "react-redux";
import { getUserById, updateUser } from "../apis/userApi";
import { toast } from "react-toastify";
import { setUser } from "../redux/userSlice";


export default function EditProfilePage() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.user);
  const userId = user.userId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
	name: "",
	email: "",
	phone: "",
	city: "",
	password: "",
  });

  const cities = [
	"Mumbai", "Delhi", "Bengaluru", "Chennai", "Kolkata",
	"Hyderabad", "Jaipur", "Agra", "Lucknow", "Goa",
  ];

  // Load user data
  useEffect(() => {
	const load = async () => {
	  try {
		const res = await getUserById(userId);
		const data = res.data;

		setForm({
		  name: data.name || "",
		  email: data.email || "",
		  phone: data.phone || "",
		  city: data.city || "",
		  password: "", // deliberately empty for security
		});

	  } catch (err) {
		console.error(err);
		toast.error("Failed to load profile");
	  } finally {
		setLoading(false);
	  }
	};

	if (userId) load();
  }, [userId]);

  const handleChange = (e) => {
	const { name, value } = e.target;
	setForm((p) => ({ ...p, [name]: value }));
  };

	const handleSave = async () => {
		if (!form.name.trim() || !form.phone.trim() || !form.city.trim()) {
			toast.warning("Please fill all required fields.");
			return;
		}

		setSaving(true);

		try {
			const payload = {
				name: form.name,
				email: form.email,
				phone: form.phone,
				city: form.city,
				role: user.role,
				password: form.password.trim() ? form.password : undefined
			};

			if (!payload.password) delete payload.password;

			const res = await updateUser(userId, payload);

			// ----------------------------
			// 🔥 UPDATE REDUX USER STORE
			// ----------------------------
			dispatch(setUser({
				userId,
				name : res.data.name,
				email: res.data.email,
				role: user.role,
				city: res.data.city,
				name: res.data.name,
				phone: res.data.phone,
				isAuthenticated: true,
			}));

			toast.success("Profile updated successfully!");
		} catch (err) {
			console.error(err);
			toast.error("Failed to update profile");
		} finally {
			setSaving(false);
		}
	};


  if (loading) {
	return (
	  <Box p={10} color="white" bg="gray.900" minH="100vh">
		Loading profile...
	  </Box>
	);
  }

  return (
	<Box bg="gray.900" color="white" minH="100vh" py={10} px={6}>
	  <Box
		maxW="600px"
		mx="auto"
		p={8}
		bg="gray.800"
		borderRadius="lg"
		boxShadow="xl"
	  >
		<Heading size="lg" mb={6} textAlign="center">
		  Edit Profile
		</Heading>

		<VStack spacing={5} align="stretch">
		  <FormControl>
			<FormLabel color="gray.300">Full Name</FormLabel>
			<Input
			  name="name"
			  bg="gray.700"
			  value={form.name}
			  onChange={handleChange}
			/>
		  </FormControl>

		  <FormControl>
			<FormLabel color="gray.300">Email (cannot be changed)</FormLabel>
			<Input
			  name="email"
			  bg="gray.700"
			  value={form.email}
			  isDisabled
			/>
		  </FormControl>

		  <FormControl>
			<FormLabel color="gray.300">Phone</FormLabel>
			<Input
			  name="phone"
			  bg="gray.700"
			  value={form.phone}
			  onChange={handleChange}
			/>
		  </FormControl>

		  <FormControl>
			<FormLabel color="gray.300">City</FormLabel>
			<Select
			  name="city"
			  bg="gray.700"
			  value={form.city}
			  onChange={handleChange}
			>
			  <option value="" disabled style={{ background: "#1A202C" }}>
				Select City
			  </option>

			  {cities.map((c) => (
				<option
				  key={c}
				  value={c}
				  style={{ background: "#1A202C", color: "white" }}
				>
				  {c}
				</option>
			  ))}
			</Select>
		  </FormControl>

		  <Divider borderColor="gray.600" />

		  <FormControl>
			<FormLabel color="gray.300">
			  Change Password (optional)
			</FormLabel>
			<Input
			  name="password"
			  type="password"
			  placeholder="Enter new password"
			  bg="gray.700"
			  value={form.password}
			  onChange={handleChange}
			/>
		  </FormControl>

		  <Button
			colorScheme="teal"
			w="full"
			mt={4}
			onClick={handleSave}
			isLoading={saving}
		  >
			Save Changes
		  </Button>
		</VStack>
	  </Box>
	</Box>
  );
}
