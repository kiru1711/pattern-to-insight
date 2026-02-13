import { useNavigate } from "react-router-dom";
import "../styles/RoleSelection.css";

function RoleSelection({ onRoleSelect }) {
  const navigate = useNavigate();

  const handleAdminSelect = () => {
    onRoleSelect("admin");
    navigate("/analysis/admin");
  };

  const handleStudentSelect = () => {
    onRoleSelect("student");
    navigate("/analysis/student");
  };

  return (
    <div className="role-selection">
      <div className="role-container">
        <h1>Select Your Role</h1>
        <p>Choose how you'd like to view the analysis</p>

        <div className="role-options">
          <button
            className="role-button admin-button"
            onClick={handleAdminSelect}
          >
            <div className="role-icon">👨‍💼</div>
            <h2>Admin / Faculty</h2>
            <p>View overall analysis and insights</p>
          </button>

          <button
            className="role-button student-button"
            onClick={handleStudentSelect}
          >
            <div className="role-icon">👤</div>
            <h2>Student / User</h2>
            <p>View personalized analysis</p>
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleSelection;
