import { lazy, Suspense, useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./components/Home";
import { SCREENS } from "./constants/screens";

// Ленивая загрузка «тяжёлых» экранов: на главную приходит минимальный бандл,
// остальные чанки подгружаются по мере навигации.
const WordList = lazy(() => import("./components/WordList"));
const TrainingSetup = lazy(() => import("./components/TrainingSetup"));
const TrainingCards = lazy(() => import("./components/TrainingCards"));

function ScreenFallback() {
  return <div className="page-placeholder">Загрузка…</div>;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState(SCREENS.HOME);
  const [trainingWords, setTrainingWords] = useState([]);

  const startTraining = (words) => {
    setTrainingWords(words);
    setCurrentScreen(SCREENS.TRAINING_CARDS);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case SCREENS.WORD_LIST:
        return <WordList onBack={() => setCurrentScreen(SCREENS.HOME)} />;
      case SCREENS.TRAINING_SETUP:
        return (
          <TrainingSetup
            onStart={startTraining}
            onBack={() => setCurrentScreen(SCREENS.HOME)}
          />
        );
      case SCREENS.TRAINING_CARDS:
        return (
          <TrainingCards
            words={trainingWords}
            onBack={() => setCurrentScreen(SCREENS.TRAINING_SETUP)}
          />
        );
      case SCREENS.PROFILE:
        return (
          <div className="page-placeholder">
            <h1>Профиль</h1>
            <p>Раздел в разработке 🚧</p>
          </div>
        );
      case SCREENS.HOME:
      default:
        return <Home />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      <main className="app-content">
        <Suspense fallback={<ScreenFallback />}>{renderScreen()}</Suspense>
      </main>
    </div>
  );
}

export default App;
