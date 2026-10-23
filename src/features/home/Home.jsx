import Calendar from "./Calendar";
import ScheduleCard from "./ScheduleCard";
import { useAuth } from "../../context/AuthContext";
import Greeting from "./Greeting";
import RoomLegend from "./RoomLegend";

const Home = ({ onNavigate }) => {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <Greeting onLogin={() => onNavigate("profile")} />
      <div className="home-grid">
        <div className="home-column">
          <Calendar />
        </div>
        <div className="home-column">
          <ScheduleCard />
        </div>
      </div>
      <RoomLegend />
    </div>
  );
};

export default Home;
