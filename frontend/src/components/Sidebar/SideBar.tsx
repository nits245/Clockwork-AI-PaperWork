import "./SideBar.scss";
import { NavLink } from "react-router-dom";
import Logo from "../../img/sidebar/logo.svg";
import Dashboard from "../../img/sidebar/adjust.svg";
import Profile from "../../img/sidebar/Group.svg";
import Calendar from "../../img/sidebar/cal.svg";
import Project from "../../img/sidebar/project.svg";
import Milestone from "../../img/sidebar/milestone.svg";
import Task from "../../img/sidebar/task.svg";
import Comp from "../../img/sidebar/company.svg";
import Department from "../../img/sidebar/department.svg";
import Teams from "../../img/sidebar/team.svg";
import Paperwork from "../../img/sidebar/paperwork.svg";
import Roster from "../../img/sidebar/roster.svg";
import Permission from "../../img/sidebar/permission.svg";
import Policies from "../../img/sidebar/policy.svg";
import Logout from "../../img/sidebar/logout.svg";
import Setting from "../../img/sidebar/setting.svg";
import Variables from "../../img/sidebar/adjust.svg"; // Using adjust icon for variables
import { useFetchUser } from "../../hooks/useFetchUser";

const SideBar: React.FC = () => {
  const [user, handleSignOut] = useFetchUser();

  return (
    <div className="sidebar">
      <div className="top">
        <div className="logo">
          <NavLink to="/">
            <img src={Logo} alt="logo" />
          </NavLink>
        </div>
      </div>

      <div className="mid">
        <p className="body">MENU</p>
        <div className="items">
          <NavLink to="/" className="item body">
            <img src={Dashboard} alt="Dashboard" />
            <span>Dashboard</span>
          </NavLink>

          <NavLink to="/profile" className="item body">
            <img src={Profile} alt="Profile" />
            <span>Profile</span>
          </NavLink>

          <NavLink to="/calendar" className="item body">
            <img src={Calendar} alt="Calendar" />
            <span>Calendar</span>
          </NavLink>

          <NavLink to="/projects" className="item body">
            <img src={Project} alt="Projects" />
            <span>Projects</span>
          </NavLink>

          <NavLink to="/milestone" className="item body">
            <img src={Milestone} alt="Milestone" />
            <span>Milestone</span>
          </NavLink>

          <NavLink to="/tasks" className="item body">
            <img src={Task} alt="Tasks" />
            <span>Tasks</span>
          </NavLink>

          <NavLink to="/company" className="item body">
            <img src={Comp} alt="Company" />
            <span>Company</span>
          </NavLink>

          <NavLink to="/department" className="item body">
            <img src={Department} alt="Department" />
            <span>Department</span>
          </NavLink>

          <NavLink to="/teams" className="item body">
            <img src={Teams} alt="Teams" />
            <span>Teams</span>
          </NavLink>

          <NavLink to="/paperwork" className="item body">
            <img src={Paperwork} alt="Paperwork" />
            <span>Paperwork</span>
          </NavLink>

          <NavLink to="/roster" className="item body">
            <img src={Roster} alt="Roster" />
            <span>Roster</span>
          </NavLink>

          <NavLink to="/permission" className="item body">
            <img src={Permission} alt="Permission" />
            <span>Permission</span>
          </NavLink>

          {/*  Policies page link */}
          <NavLink to="/policy" className="item body">
            <img src={Policies} alt="Policies" />
            <span>Policies</span>
          </NavLink>

          {/*  Master Variables page link */}
          <NavLink to="/master-variables" className="item body">
            <img src={Variables} alt="Master Variables" />
            <span>Variables</span>
          </NavLink>

          <div className="item body" onClick={handleSignOut}>
            <img src={Logout} alt="Logout" />
            <span>Logout</span>
          </div>

          <NavLink to="/settings" className="item body">
            <img src={Setting} alt="Settings" />
            <span>Settings</span>
          </NavLink>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
