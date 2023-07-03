import { useNavigate } from "react-router-dom";
import "./taskcard.css";

export default function TaskCard({
  task,
  setSelectedTask,
  categoryIcons,
  allUsers,
}) {
  const navigate = useNavigate();

  function getCreatorName(creatorId) {
    if (allUsers && allUsers.length > 0) {
      const creator = allUsers.find((user) => user.id === creatorId);
      if (creator) {
        return `${creator.firstname} ${creator.surname}`;
      } else {
        return "Anon";
      }
    }
  }

  function getDistance(creatorId) {
    if (allUsers && allUsers.length > 0) {
      const creator = allUsers.find((user) => user.id === creatorId);
      if (creator && creator.distance && creator.distance !== "N/A") {
        return `${creator.distance} miles`;
      }
    }
    return "unknown distance";
  }

  function handleSelectTask(taskId) {
    return () => {
      setSelectedTask(taskId);
      navigate(`/view`);
    };
  }

  return (
    <div onClick={handleSelectTask(task.id)} className="task-card">
      <div className="image">
        <img
          className="category-icon"
          src={categoryIcons[task.category_id - 1].image}
          alt="task-icon"
        />
      </div>

      <div className="card-info">
        <h2 className="task-title-container">{task.title}</h2>
        <p>
          <strong>Posted by: </strong>
          {getCreatorName(task.creator_id)}
        </p>
        <p>
          <strong>Duration: </strong>
          {task.duration}
        </p>

        <p>
          <strong>Location: </strong>
          {`${task.location} (${getDistance(task.creator_id)} away)`}
        </p>
      </div>
    </div>
  );
}
