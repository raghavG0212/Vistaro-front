// src/components/Faqs.jsx

import { Box, Heading, Text, SimpleGrid } from "@chakra-ui/react";
import Tilt from "react-parallax-tilt";
import HeadingComponent from "./HeadingComponent";

export default function Faqs() {
  return (
    <Box mb={16} px={4}>
      {/* SECTION HEADING */}
      <HeadingComponent heading={"frequently asked questions"}/>

      {/* GRID OF 3 TILT CARDS */}
      <SimpleGrid
        columns={{ base: 1, sm: 2, lg: 3 }}
        spacing={8}
        mt={10}
      >

        {/* CARD 1 */}
        <Tilt
          glareEnable={true}
          glareMaxOpacity={0.35}
          glareColor="#ffffff"
          glarePosition="all"
          tiltMaxAngleX={12}
          tiltMaxAngleY={12}
          scale={1.05}
          transitionSpeed={2500}
        >
          <Box
            bg="whiteAlpha.200"
            backdropFilter="blur(14px)"
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.25)"
            p={6}
            h="100%"
            boxShadow="0 0 18px rgba(255, 70, 70, 0.25)"
            _hover={{
              boxShadow: "0 0 25px rgba(255, 70, 70, 0.55)",
            }}
          >
            <Heading
              fontSize="2xl"
              mb={4}
              textAlign="center"
              color="red.300"
            >
              Movie Booking FAQs
            </Heading>

            <Text color="white" mb={3}>
              <b>How do I book tickets?</b><br />
              Choose a movie → showtime → seats → pay securely.
            </Text>

            <Text color="white" mb={3}>
              <b>Can tickets be cancelled?</b><br />
              Yes, up to 2 hours before showtime (selected theatres only).
            </Text>

            <Text color="white">
              <b>Do I get an e-ticket?</b><br />
              You receive an instant QR-enabled digital ticket.
            </Text>
          </Box>
        </Tilt>

        {/* CARD 2 */}
        <Tilt
          glareEnable={true}
          glareMaxOpacity={0.35}
          glareColor="#ffffff"
          glarePosition="all"
          tiltMaxAngleX={12}
          tiltMaxAngleY={12}
          scale={1.05}
          transitionSpeed={2500}
        >
          <Box
            bg="whiteAlpha.200"
            backdropFilter="blur(14px)"
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.25)"
            p={6}
            h="100%"
            boxShadow="0 0 18px rgba(150, 90, 255, 0.25)"
            _hover={{
              boxShadow: "0 0 25px rgba(150, 90, 255, 0.55)",
            }}
          >
            <Heading
              fontSize="2xl"
              mb={4}
              textAlign="center"
              color="purple.300"
            >
              Sports Event FAQs
            </Heading>

            <Text color="white" mb={3}>
              <b>Are seats reserved?</b><br />
              Yes, stadiums offer reserved seat selection via Vistaro.
            </Text>

            <Text color="white" mb={3}>
              <b>Are VIP passes available?</b><br />
              Yes, for select matches and tournaments.
            </Text>

            <Text color="white">
              <b>Is photography allowed?</b><br />
              Depends on the venue; some restrict long lenses.
            </Text>
          </Box>
        </Tilt>

        {/* CARD 3 */}
        <Tilt
          glareEnable={true}
          glareMaxOpacity={0.35}
          glareColor="#ffffff"
          glarePosition="all"
          tiltMaxAngleX={12}
          tiltMaxAngleY={12}
          scale={1.05}
          transitionSpeed={2500}
        >
          <Box
            bg="whiteAlpha.200"
            backdropFilter="blur(14px)"
            borderRadius="2xl"
            border="1px solid rgba(255,255,255,0.25)"
            p={6}
            h="100%"
            boxShadow="0 0 18px rgba(70, 120, 255, 0.25)"
            _hover={{
              boxShadow: "0 0 25px rgba(70, 120, 255, 0.55)",
            }}
          >
            <Heading
              fontSize="2xl"
              mb={4}
              textAlign="center"
              color="blue.300"
            >
              Events & Shows FAQs
            </Heading>

            <Text color="white" mb={3}>
              <b>Are kids allowed?</b><br />
              Most events allow kids unless marked as 18+.
            </Text>

            <Text color="white" mb={3}>
              <b>What if an event gets postponed?</b><br />
              Tickets remain valid; refund available if you can’t attend.
            </Text>

            <Text color="white">
              <b>Do events require e-passes?</b><br />
              Yes, QR-based entry passes are issued instantly.
            </Text>
          </Box>
        </Tilt>

      </SimpleGrid>
    </Box>
  );
}
