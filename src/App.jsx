import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import WordList from "./components/WordList";
import TrainingSetup from "./components/TrainingSetup";
import TrainingCards from "./components/TrainingCards";
// import "./App.css";

function App() {
  const [currentScreen, setCurrentScreen] = useState("home");
  const [trainingWords, setTrainingWords] = useState([]);

  const startTraining = (words) => {
    setTrainingWords(words);
    setCurrentScreen("trainingCards");
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home />;
      case "wordList":
        return <WordList onBack={() => setCurrentScreen("home")} />;
      case "trainingSetup":
        return (
          <TrainingSetup
            onStart={startTraining}
            onBack={() => setCurrentScreen("home")}
          />
        );
      case "trainingCards":
        return (
          <TrainingCards
            words={trainingWords}
            onBack={() => setCurrentScreen("trainingSetup")}
          />
        );
      case "profile":
        return (
          <div className="page-placeholder">
            <h1>Профиль</h1>
            <p>Раздел в разработке 🚧</p>
          </div>
        );
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      <main className="app-content">{renderScreen()}</main>
    </div>
  );
}

export default App;
