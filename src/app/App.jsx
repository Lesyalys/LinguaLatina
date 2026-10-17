import { useState } from "react";
import Sidebar from "../components/layout/Sidebar";
import Home from "../features/home/Home";
import WordList from "../features/dictionary/WordList";
import TrainingSetup from "../features/training/TrainingSetup";
import TrainingCards from "../features/training/TrainingCards";
import ProfilePage from "../features/profile/ProfilePage";
import { useAuth } from "../context/AuthContext";
import FriendsPage from "../features/friends/FriendsPage";
import UserProfilePage from "../features/profile/UserProfilePage";
import ExamSubjects from "../features/exam/ExamSubjects";
import AnatomyTickets from "../features/exam/AnatomyTickets";

function App() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState("home");
  const [trainingWords, setTrainingWords] = useState([]);
  const [trainingGroups, setTrainingGroups] = useState([]);
  const [viewingUserId, setViewingUserId] = useState(null); // ← новое

  if (loading) {
    return <div className="app-loading">Загрузка...</div>;
  }
  const openUserProfile = (userId) => {
    setViewingUserId(userId);
    setCurrentScreen("userProfile");
  };

  const startTraining = (words, groups) => {
    setTrainingWords(words);
    setTrainingGroups(groups); // ← сохраняем
    setCurrentScreen("trainingCards");
  };

  // Проверка доступа к защищённым экранам
  const requireAuth = (screen) => {
    if (!user) {
      // Показываем AuthPage на месте экрана
      return <ProfilePage onBack={() => setCurrentScreen("home")} />;
    }
    return screen;
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home onNavigate={setCurrentScreen} />;

      case "wordList":
        // Словарь доступен всем
        return <WordList onBack={() => setCurrentScreen("home")} />;

      case "trainingSetup":
        // Тренировка только для авторизованных
        if (!user) {
          return <ProfilePage onBack={() => setCurrentScreen("home")} />;
        }
        return (
          <TrainingSetup
            onStart={startTraining}
            onBack={() => setCurrentScreen("home")}
          />
        );

      case "trainingCards":
        if (!user) {
          return <ProfilePage onBack={() => setCurrentScreen("home")} />;
        }
        return (
          <TrainingCards
            words={trainingWords}
            selectedGroups={trainingGroups}
            onBack={() => setCurrentScreen("trainingSetup")}
          />
        );

      case "profile":
        // ProfilePage сам решает: показать данные или форму входа
        return <ProfilePage onBack={() => setCurrentScreen("home")} />;

      case "friends":
        if (!user)
          return <ProfilePage onBack={() => setCurrentScreen("home")} />;
        return <FriendsPage onOpenProfile={openUserProfile} />;

      case "userProfile":
        return (
          <UserProfilePage
            userId={viewingUserId}
            onBack={() => {
              setViewingUserId(null);
              setCurrentScreen("friends");
            }}
          />
        );
      case "examSubjects":
        return (
          <ExamSubjects
            onOpenSubject={(subjectId) => {
              if (subjectId === "anatomy") {
                setCurrentScreen("anatomyTickets");
              }
            }}
          />
        );

      case "anatomyTickets":
        return (
          <AnatomyTickets onBack={() => setCurrentScreen("examSubjects")} />
        );

      default:
        return <Home onNavigate={setCurrentScreen} />;
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
