import React from "react";
import Header from "./Header";
import UserList from "../users/UserList";
import TaskBoard from "../tasks/TaskBoard";
import Chat from "../chat/Chat";
import "./Dashboard.css";

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-content">
        <div className="sidebar">
          <UserList />
        </div>
        <main className="main-content">
          <TaskBoard />
        </main>
      </div>
      <Chat />
    </div>
  );
};

export default Dashboard;
