import { useAccount } from "wagmi";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";

function App() {
  const { isConnected } = useAccount();
  if (isConnected) return <Dashboard />;
  return <Landing />;
}

export default App;
