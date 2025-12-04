// src/components/FooterCom.jsx
import {
  Box,
  Flex,
  Text,
  Link as ChakraLink,
  Input,
  Button,
  VStack,
  HStack,
  Divider,
  Image,
  SimpleGrid,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { BsInstagram, BsTwitterX, BsGithub } from "react-icons/bs";
import { FaLinkedinIn } from "react-icons/fa";

export default function FooterCom() {
  return (
    <Box bg="gray.900" color="gray.300" borderTop="6px solid" borderColor="teal.600">
      <Box maxW="7xl" mx="auto" px={6} py={10}>

        {/* ---- TOP SECTION ---- */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={10}>

          {/* BRAND */}
          <Box>
            <Link to="/">
              <Image src="/Logo-final-2.png" alt="Vistaro" w="150px" mb={4} />
            </Link>
            <Text fontSize="sm" color="gray.500">
              Turning Moments into Memories
            </Text>
          </Box>

          {/* COMPANY */}
          <Box>
            <Text fontWeight="bold" fontSize="lg" color="white" mb={3}>
              Company
            </Text>
            <VStack align="start" spacing={2} fontSize="sm">
              <ChakraLink as={Link} to="/about" _hover={{ color: "teal.400" }}>
                About Vistaro
              </ChakraLink>
              <ChakraLink as={Link} to="/how-it-works" _hover={{ color: "teal.400" }}>
                How It Works
              </ChakraLink>
              <ChakraLink as={Link} to="/offers" _hover={{ color: "teal.400" }}>
                Offers & Deals
              </ChakraLink>
              <ChakraLink as={Link} to="/blog" _hover={{ color: "teal.400" }}>
                Blog
              </ChakraLink>
            </VStack>
          </Box>

          {/* QUICK LINKS */}
          <Box>
            <Text fontWeight="bold" fontSize="lg" color="white" mb={3}>
              Quick Links
            </Text>
            <VStack align="start" spacing={2} fontSize="sm">
              <ChakraLink as={Link} to="/help" _hover={{ color: "teal.400" }}>
                Help Center
              </ChakraLink>
              <ChakraLink as={Link} to="/faq" _hover={{ color: "teal.400" }}>
                FAQs
              </ChakraLink>
              <ChakraLink as={Link} to="/contact" _hover={{ color: "teal.400" }}>
                Contact Us
              </ChakraLink>
              <ChakraLink as={Link} to="/careers" _hover={{ color: "teal.400" }}>
                Careers
              </ChakraLink>
            </VStack>
          </Box>

          {/* NEWSLETTER */}
          <Box>
            <Text fontWeight="bold" fontSize="lg" color="white" mb={3}>
              Newsletter
            </Text>
            <Text fontSize="sm" color="gray.400" mb={3}>
              Subscribe to get the latest updates, deals & offers.
            </Text>

            <HStack spacing={2}>
              <Input
                placeholder="Enter your email"
                variant="filled"
                bg="gray.800"
                _focus={{ bg: "gray.700" }}
              />
              <Button colorScheme="teal">Subscribe</Button>
            </HStack>
          </Box>

        </SimpleGrid>

        {/* DIVIDER */}
        <Divider my={8} borderColor="gray.700" />

        {/* ---- BOTTOM SECTION ---- */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          align="center"
          justify="space-between"
        >
          <Text fontSize="sm" color="gray.500">
            © {new Date().getFullYear()} Vistaro — All rights reserved.
          </Text>

          {/* SOCIAL ICONS */}
          <HStack spacing={5} mt={{ base: 4, sm: 0 }} fontSize="xl" color="gray.400">
            <ChakraLink href="https://linkedin.com" target="_blank" _hover={{ color: "teal.400" }}>
              <FaLinkedinIn />
            </ChakraLink>
            <ChakraLink href="https://instagram.com" target="_blank" _hover={{ color: "teal.400" }}>
              <BsInstagram />
            </ChakraLink>
            <ChakraLink href="https://twitter.com" target="_blank" _hover={{ color: "teal.400" }}>
              <BsTwitterX />
            </ChakraLink>
            <ChakraLink href="https://github.com" target="_blank" _hover={{ color: "teal.400" }}>
              <BsGithub />
            </ChakraLink>
          </HStack>
        </Flex>

        {/* CONTACT INFO (BOTTOM MINI BAR) */}
        <Flex
          direction={{ base: "column", sm: "row" }}
          justify="center"
          mt={6}
          fontSize="sm"
          color="gray.500"
          gap={6}
        >
          <Text>Email: support@vistaro.com</Text>
          <Text>Phone: +91-9876543210</Text>
          <Text>Address: Chandigarh, India</Text>
        </Flex>

      </Box>
    </Box>
  );
}
