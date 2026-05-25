import { useAccount } from "wagmi";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";

function App() {
  const { isConnected } = useAccount();
  return isConnected ? <Dashboard /> : <Landing />;
}

export default App;
