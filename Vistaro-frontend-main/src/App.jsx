import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Footer from "./components/Footer";
import About from "./pages/About";
import Signup from "./pages/Signup";
import Blog from "./pages/Blog";
import CancellationRefund from "./pages/CancellationRefund";
import Login from "./pages/Login";
import HowItWorks from "./pages/HowItWorks";
import Offers from "./pages/Offers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import { Bounce, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EventDetailsPage from "./pages/EventDetailsPage";
import EventBookingPage from "./pages/EventBookingPage";
import BookingConfirmPage from "./pages/BookingConfirmPage";
import Events from "./pages/Events";
import Movies from "./pages/Movies";
import Sports from "./pages/Sports";
import { useDispatch } from "react-redux";
import { loadUserFromStorage } from "./redux/userSlice";
import { useEffect } from "react";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, []);
  return (
    <ChakraProvider>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<About />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/cancellation-refund" element={<CancellationRefund />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/events" element={<Events />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/event/:eventId" element={<EventDetailsPage />} />
        <Route path="/eventslots/:eventId" element={<EventBookingPage />} />
        <Route path="/booking/confirm" element={<BookingConfirmPage />} />
      </Routes>
      <Footer />
      <ToastContainer
        position="top-center"
        autoClose={1500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="dark"
        transition={Bounce}
      />
    </ChakraProvider>
  );
}

export default App;