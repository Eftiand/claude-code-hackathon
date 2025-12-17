import InteractiveGlobe from './components/Globe';
import { mockLocations, transformToGlobePins } from './mocks/locations';
import './App.css';

function App() {
  const pins = transformToGlobePins(mockLocations);

  return (
    <div className="app">
      <InteractiveGlobe pins={pins} />
    </div>
  );
}

export default App;
