import React, { useState } from "react";
import QuestionManagement from "./QuestionManagement";
import UserManagement from "./UserManagement";
import ParameterManagement from "./ParameterManagement";

const tabs = [
  {
    id: "users",
    label: "Usuarios",
    icon: "group",
    description: "Roles, permisos y cuentas activas",
  },
  {
    id: "questions",
    label: "Preguntas",
    icon: "quiz",
    description: "Cuestionario y orden del diagnostico",
  },
  {
    id: "parameters",
    label: "Parametros",
    icon: "tune",
    description: "Factores de emision por categoria",
  },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("users");
  const [refreshKey, setRefreshKey] = useState(0);
  const activeTabInfo = tabs.find((tab) => tab.id === activeTab);

  const refreshPanel = () => {
    setRefreshKey((current) => current + 1);
  };

  return (
    <main className="admin-page">
      <div className="admin-nature-layer" aria-hidden="true">
        <span className="admin-canopy canopy-left" />
        <span className="admin-canopy canopy-right" />
        <span className="admin-ground-line" />
        <span className="admin-leaf leaf-a material-symbols-outlined">eco</span>
        <span className="admin-leaf leaf-b material-symbols-outlined">
          psychiatry
        </span>
        <span className="admin-leaf leaf-c material-symbols-outlined">
          energy_savings_leaf
        </span>
        <span className="admin-leaf leaf-d material-symbols-outlined">
          local_florist
        </span>
        <span className="admin-vine" />
      </div>

      <section className="admin-hero animate-rise">
        <div>
          <span className="admin-eyebrow">Centro de control</span>
          <h1>Panel de Administracion</h1>
          <p>
            Ajusta usuarios, preguntas y parametros desde una vista mas clara,
            rapida y preparada para trabajar sin perder contexto.
          </p>
        </div>

        <div className="admin-hero-card hover-lift">
          <span className="material-symbols-outlined animate-pulse-soft">
            verified
          </span>
          <div>
            <strong>EcoHuella Admin</strong>
            <small>{activeTabInfo.description}</small>
          </div>
        </div>
      </section>

      <div className="admin-toolbar animate-pop">
        <nav className="admin-tabs" aria-label="Secciones de administracion">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`admin-tab ${activeTab === tab.id ? "active" : ""}`}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={refreshPanel}
          title="Actualizar panel"
          aria-label="Actualizar panel de administracion"
        >
          <span className="material-symbols-outlined">refresh</span>
          <span>Actualizar</span>
        </button>
      </div>

      <section className="admin-panel-body animate-rise">
        {activeTab === "users" && <UserManagement key={`users-${refreshKey}`} />}
        {activeTab === "questions" && (
          <QuestionManagement key={`questions-${refreshKey}`} />
        )}
        {activeTab === "parameters" && (
          <ParameterManagement key={`parameters-${refreshKey}`} />
        )}
      </section>
    </main>
  );
};

export default AdminPanel;
