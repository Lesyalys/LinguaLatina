import { useState, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import Home from "../features/home/Home";
import WordList from "../features/dictionary/WordList";
import TrainingSetup from "../features/training/TrainingSetup";
import TrainingCards from "../features/training/TrainingCards";
import ProfilePage from "../features/profile/ProfilePage";
import { useAuth } from "../context/AuthContext";
import FriendsPage from "../features/friends/FriendsPage";
import UserProfilePage from "../features/profile/UserProfilePage";
import MaterialsPage from "../features/materials/MaterialsPage";
import AnatomyTickets from "../features/exam/AnatomyTickets";
import ExamQuiz from "../features/exam/ExamQuiz";
import { SubjectActions } from "../features/subjects/SubjectActions";
import ExamSubjectActions from "../features/exam/ExamSubjectActions";
import GamesPage from "../features/games/GamesPage";
import GameRoom from "../features/games/GameRoom";
import GameInviteListener from "../features/games/GameInviteListener";
import { supabase } from "../lib/supabase";

function App() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState("home");
  const [trainingWords, setTrainingWords] = useState([]);
  const [trainingGroups, setTrainingGroups] = useState([]);
  const [viewingUserId, setViewingUserId] = useState(null);
  const [activeGameId, setActiveGameId] = useState(null);

  const [selectedSubject, setSelectedSubject] = useState(null);
  const [selectedExamSubject, setSelectedExamSubject] = useState(null);

  // 🎮 Глобальная подписка на игры
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`app-games:${user.id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "games" },
        (payload) => {
          const game = payload.new;
          if (
            (game.host_id === user.id || game.guest_id === user.id) &&
            game.status === "active"
          ) {
            setActiveGameId(game.id);
          }
        },
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [user]);

  if (loading) return <div className="app-loading">Загрузка...</div>;

  const startTraining = (words, groups) => {
    setTrainingWords(words);
    setTrainingGroups(groups);
    setCurrentScreen("trainingCards");
  };

  const openUserProfile = (userId) => {
    setViewingUserId(userId);
    setCurrentScreen("userProfile");
  };

  const requireAuth = (screen) => {
    if (!user) {
      setCurrentScreen("profile");
      return false;
    }
    setCurrentScreen(screen);
    return true;
  };

  const renderScreen = () => {
    // 🎮 Если есть активная игра — рендерим GameRoom поверх всего
    if (activeGameId) {
      return (
        <GameRoom
          gameId={activeGameId}
          onExit={() => {
            setActiveGameId(null);
            setCurrentScreen("home");
          }}
        />
      );
    }

    switch (currentScreen) {
      case "home":
        return <Home onNavigate={setCurrentScreen} />;

      case "games":
        if (!user)
          return <ProfilePage onBack={() => setCurrentScreen("home")} />;
        return <GamesPage onGameStart={(id) => setActiveGameId(id)} />;

      // ============================================================
      // МАТЕРИАЛЫ
      // ============================================================
      case "materials":
        return (
          <MaterialsPage
            onOpenSubject={(material) => {
              if (material.type === "subject") {
                setSelectedSubject(material);
                setCurrentScreen("subjectActions");
              } else if (material.type === "exam") {
                setSelectedExamSubject(material);
                setCurrentScreen("examSubjectActions");
              }
            }}
          />
        );

      // ------------------------------------------------------------
      // ЛАТИНСКИЙ
      // ------------------------------------------------------------
      case "subjectActions":
        return (
          <SubjectActions
            subject={selectedSubject}
            onOpenAction={(action) => {
              if (action.id === "wordList") {
                setCurrentScreen("wordList");
              }
              if (action.id === "training") {
                requireAuth("trainingSetup");
              }
            }}
            onBack={() => setCurrentScreen("materials")}
          />
        );

      case "wordList":
        return (
          <WordList
            dataFile={
              selectedSubject?.actions.find((a) => a.id === "wordList")
                ?.dataFile
            }
            onBack={() =>
              setCurrentScreen(user ? "subjectActions" : "materials")
            }
          />
        );

      case "trainingSetup":
        if (!user)
          return <ProfilePage onBack={() => setCurrentScreen("home")} />;
        return (
          <TrainingSetup
            dataFile={
              selectedSubject?.actions.find((a) => a.id === "training")
                ?.dataFile
            }
            onStart={startTraining}
            onBack={() => setCurrentScreen("subjectActions")}
          />
        );

      case "trainingCards":
        if (!user)
          return <ProfilePage onBack={() => setCurrentScreen("home")} />;
        return (
          <TrainingCards
            words={trainingWords}
            selectedGroups={trainingGroups}
            onBack={() => setCurrentScreen("trainingSetup")}
          />
        );

      // ------------------------------------------------------------
      // АНАТОМИЯ
      // ------------------------------------------------------------
      case "examSubjectActions":
        return (
          <ExamSubjectActions
            subject={selectedExamSubject}
            onOpenAction={(action) => {
              if (action.id === "tickets") {
                setCurrentScreen("anatomyTickets");
              }
              if (action.id === "examQuiz") {
                requireAuth("examQuiz");
              }
            }}
            onBack={() => setCurrentScreen("materials")}
          />
        );

      case "anatomyTickets":
        return (
          <AnatomyTickets
            dataFile={
              selectedExamSubject?.actions.find((a) => a.id === "tickets")
                ?.dataFile
            }
            onBack={() =>
              setCurrentScreen(user ? "examSubjectActions" : "materials")
            }
          />
        );

      case "examQuiz":
        if (!user)
          return <ProfilePage onBack={() => setCurrentScreen("home")} />;
        return (
          <ExamQuiz
            dataFile={
              selectedExamSubject?.actions.find((a) => a.id === "examQuiz")
                ?.dataFile
            }
            onBack={() => setCurrentScreen("examSubjectActions")}
          />
        );

      // ============================================================
      // ДРУЗЬЯ, ПРОФИЛЬ
      // ============================================================
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

      case "profile":
        return <ProfilePage onBack={() => setCurrentScreen("home")} />;

      default:
        return <Home onNavigate={setCurrentScreen} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      <main className="app-content">{renderScreen()}</main>

      <GameInviteListener onAccepted={(gameId) => setActiveGameId(gameId)} />
    </div>
  );
}

export default App;
