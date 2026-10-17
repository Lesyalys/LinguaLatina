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
import SubjectsPage from "../features/subjects/SubjectsPage";
import ExamSubjectsPage from "../features/exam/ExamSubjectsPage";
import AnatomyTickets from "../features/exam/AnatomyTickets";

import SubjectActions from "../features/subjects/SubjectActions";
import ExamSubjectActions from "../features/exam/ExamSubjectActions";

function App() {
  const { user, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState("home");
  const [trainingWords, setTrainingWords] = useState([]);
  const [trainingGroups, setTrainingGroups] = useState([]);
  const [viewingUserId, setViewingUserId] = useState(null);

  // Выбранный предмет (для плитки действий)
  const [selectedSubject, setSelectedSubject] = useState(null); // id: 'latin', ...
  const [selectedExamSubject, setSelectedExamSubject] = useState(null); // id: 'anatomy', ...

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

  const renderScreen = () => {
    switch (currentScreen) {
      case "home":
        return <Home onNavigate={setCurrentScreen} />;

      // ============================================================
      // ПРЕДМЕТЫ (материалы)
      // ============================================================
      case "subjects":
        return (
          <SubjectsPage
            onOpenSubject={(subjectId) => {
              setSelectedSubject(subjectId);
              setCurrentScreen("subjectActions");
            }}
          />
        );

      case "subjectActions":
        return (
          <SubjectActions
            subjectId={selectedSubject}
            onOpenAction={(actionId) => {
              if (actionId === "wordList") setCurrentScreen("wordList");
              if (actionId === "training") {
                if (!user) {
                  setCurrentScreen("profile");
                } else {
                  setCurrentScreen("trainingSetup");
                }
              }
            }}
            onBack={() => setCurrentScreen("subjects")}
          />
        );

      case "wordList":
        return <WordList onBack={() => setCurrentScreen("subjectActions")} />;

      case "trainingSetup":
        if (!user)
          return (
            <ProfilePage onBack={() => setCurrentScreen("subjectActions")} />
          );
        return (
          <TrainingSetup
            onStart={startTraining}
            onBack={() => setCurrentScreen("subjectActions")}
          />
        );

      case "trainingCards":
        if (!user)
          return (
            <ProfilePage onBack={() => setCurrentScreen("trainingSetup")} />
          );
        return (
          <TrainingCards
            words={trainingWords}
            selectedGroups={trainingGroups}
            onBack={() => setCurrentScreen("trainingSetup")}
          />
        );

      // ============================================================
      // ЭКЗАМЕН / ЗАЧЁТ
      // ============================================================
      case "examSubjects":
        return (
          <ExamSubjectsPage
            onOpenSubject={(subjectId) => {
              setSelectedExamSubject(subjectId);
              setCurrentScreen("examSubjectActions");
            }}
          />
        );

      case "examSubjectActions":
        return (
          <ExamSubjectActions
            subjectId={selectedExamSubject}
            onOpenAction={(actionId) => {
              if (actionId === "tickets") setCurrentScreen("anatomyTickets");
            }}
            onBack={() => setCurrentScreen("examSubjects")}
          />
        );

      case "anatomyTickets":
        return (
          <AnatomyTickets
            onBack={() => setCurrentScreen("examSubjectActions")}
          />
        );

      // ============================================================
      // ОСТАЛЬНОЕ
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
    </div>
  );
}

export default App;
