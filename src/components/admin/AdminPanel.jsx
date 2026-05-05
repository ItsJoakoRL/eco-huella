import React, { useState } from "react";
import QuestionManagement from "./QuestionManagement";
import UserManagement from "./UserManagement";
import ParameterManagement from "./ParameterManagement";
import Button from "../ui/Button";
import Card from "../ui/Card";

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("users");

  const tabs = [
    { id: "users", label: "Usuarios" },
    { id: "questions", label: "Preguntas" },
    { id: "parameters", label: "Parámetros" },
  ];

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-on-surface mb-4">Panel de Administración</h1>
        
        <div className="flex gap-2 border-b border-outline">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        {activeTab === "users" && <UserManagement />}
        {activeTab === "questions" && <QuestionManagement />}
        {activeTab === "parameters" && <ParameterManagement />}
      </div>
    </div>
  );
};

export default AdminPanel;
