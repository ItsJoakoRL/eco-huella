import React, { useMemo } from 'react';
import tasksData from '../../data/daily-tasks.json';

export default function DailyDashboard({ onTaskClick, completedTasks = {} }) {
  // Calcular total de emisiones
  const totalEmissions = useMemo(() => {
    return Object.values(completedTasks).reduce((sum, task) => sum + (task?.emissions || 0), 0);
  }, [completedTasks]);

  const getImpactClass = (emissions) => {
    if (emissions < 5) return 'low';
    if (emissions < 15) return 'medium';
    return 'high';
  };

  const impactLabel = getImpactClass(totalEmissions);
  const completedCount = Object.keys(completedTasks).length;
  const totalTasks = tasksData.daily_tasks.length;

  // Calcular porcentaje de barra por impacto
  const lowPercentage = Math.min((totalEmissions / 5) * 100, 30);
  const mediumPercentage = totalEmissions > 5 ? Math.min(((totalEmissions - 5) / 10) * 100, 40) : 0;
  const highPercentage = totalEmissions > 15 ? Math.min(((totalEmissions - 15) / 10) * 100, 30) : 0;

  return (
    <div className="min-h-screen" style={{ background: '#f5f5f5' }}>
      {/* Header */}
      <div style={{ background: '#1a3a2a', padding: '14px 16px 10px', color: '#E1F5EE' }}>
        <div style={{ fontSize: '11px', color: '#9FE1CB', letterSpacing: '0.5px', marginBottom: '6px' }}>
          LUNES — 13 ABR 2026
        </div>
        <div style={{ fontSize: '17px', fontWeight: '500', color: '#E1F5EE', marginTop: '2px', marginBottom: '10px' }}>
          Mi huella de carbono
        </div>

        {/* Score Circle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              border: '3px solid #5DCAA5',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: '500',
              color: '#E1F5EE',
              lineHeight: '1'
            }}
          >
            <div>{totalEmissions.toFixed(1)}</div>
            <div style={{ fontSize: '9px', color: '#9FE1CB' }}>kg CO₂</div>
          </div>

          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '12px', color: '#9FE1CB', lineHeight: '1.5', marginBottom: '8px' }}>
              {completedCount} tareas completadas · {totalTasks - completedCount} pendientes<br />
              Estado: <strong>{impactLabel === 'low' ? 'Ligera' : impactLabel === 'medium' ? 'Moderada' : 'Pesada'}</strong>
            </p>

            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: '4px' }}>
              <div
                style={{
                  height: '5px',
                  borderRadius: '3px',
                  background: '#5DCAA5',
                  flex: lowPercentage || 0.5,
                  minWidth: '2px'
                }}
              />
              <div
                style={{
                  height: '5px',
                  borderRadius: '3px',
                  background: '#EF9F27',
                  flex: mediumPercentage || 0.5,
                  minWidth: '2px'
                }}
              />
              <div
                style={{
                  height: '5px',
                  borderRadius: '3px',
                  background: '#E24B4A',
                  flex: highPercentage || 0.5,
                  minWidth: '2px'
                }}
              />
              <div
                style={{
                  height: '5px',
                  borderRadius: '3px',
                  background: '#e0e0e0',
                  flex: Math.max(1, 5 - totalEmissions),
                  minWidth: '2px'
                }}
              />
            </div>

            <div style={{ fontSize: '11px', color: '#9FE1CB', marginTop: '4px', letterSpacing: '0.4px' }}>
              bajo · medio · alto · pendiente
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div style={{ padding: '12px' }}>
        <div style={{ fontSize: '11px', color: '#666', letterSpacing: '0.4px', marginBottom: '8px', textTransform: 'uppercase', fontWeight: '600' }}>
          Tareas de hoy
        </div>

        {tasksData.daily_tasks.map((task) => {
          const selected = completedTasks[task.id];
          const isActive = selected !== undefined;

          return (
            <div
              key={task.id}
              onClick={() => onTaskClick(task)}
              style={{
                background: '#fff',
                border: '0.5px solid #e0e0e0',
                borderRadius: '12px',
                padding: '10px 12px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                borderColor: isActive ? '#1D9E75' : '#e0e0e0',
                borderWidth: isActive ? '2px' : '0.5px',
                transition: 'all 0.15s'
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = '#d0d0d0';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = '#e0e0e0';
              }}
            >
              {/* Icon */}
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                  background: selected ? (selected.impact === 'low' ? '#EAF3DE' : selected.impact === 'medium' ? '#FAEEDA' : '#FCEBEB') : '#f5f5f5'
                }}
              >
                {selected ? selected.icon : task.emoji}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '500', color: '#333' }}>{task.name}</div>
                <div style={{ fontSize: '11px', color: '#999', marginTop: '1px' }}>{task.time}</div>
                {selected && (
                  <div
                    style={{
                      fontSize: '11px',
                      marginTop: '3px',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      display: 'inline-block',
                      background:
                        selected.impact === 'low' ? '#EAF3DE' : selected.impact === 'medium' ? '#FAEEDA' : '#FCEBEB',
                      color:
                        selected.impact === 'low' ? '#3B6D11' : selected.impact === 'medium' ? '#854F0B' : '#A32D2D'
                    }}
                  >
                    {selected.label} — {selected.emissions} kg CO₂
                  </div>
                )}
              </div>

              {/* Dot Indicator */}
              <div
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  flexShrink: 0,
                  background:
                    selected
                      ? selected.impact === 'low'
                        ? '#639922'
                        : selected.impact === 'medium'
                        ? '#BA7517'
                        : '#E24B4A'
                      : '#d0d0d0'
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Footer Stats */}
      <div style={{ padding: '16px', textAlign: 'center', color: '#666', fontSize: '12px', borderTop: '1px solid #e0e0e0', marginTop: '16px' }}>
        <p>Promedio semanal: 4.8 kg CO₂/día</p>
        <p style={{ marginTop: '6px', fontSize: '11px', color: '#999' }}>
          💡 Cambios pequeños generan grandes impactos
        </p>
      </div>
    </div>
  );
}
