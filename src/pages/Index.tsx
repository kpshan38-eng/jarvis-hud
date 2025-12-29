import { useState } from "react";
import SplashScreen from "@/components/SplashScreen";
import JarvisHUD from "@/components/JarvisHUD";

const Index = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      {!showSplash && <JarvisHUD />}
    </>
  );
};

export default Index;
