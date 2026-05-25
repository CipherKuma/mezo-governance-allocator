import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";

function App() {
  const { isConnected } = useAccount();
  const [demoMode, setDemoMode] = useState(
    () => window.location.hash.replace(/^#\/?/, "") === "demo",
  );

  useEffect(() => {
    const onHash = () =>
      setDemoMode(window.location.hash.replace(/^#\/?/, "") === "demo");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  function enterDemo() {
    window.location.hash = "demo";
    setDemoMode(true);
  }

  function exitDemo() {
    window.location.hash = "";
    setDemoMode(false);
  }

  if (isConnected) return <Dashboard readOnly={false} onExitDemo={exitDemo} />;
  if (demoMode) return <Dashboard readOnly onExitDemo={exitDemo} />;
  return <Landing onViewDemo={enterDemo} />;
}

export default App;
