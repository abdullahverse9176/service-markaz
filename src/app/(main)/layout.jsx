import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import AiAssistant from "@/app/components/ai/AiAssistant";
import VerificationBanner from "@/app/components/VerificationBanner";
import { Toaster } from 'react-hot-toast';

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <VerificationBanner />
      {children}
      <Toaster position="top-right" />
      <AiAssistant />
      <Footer />
    </>
  );
}
