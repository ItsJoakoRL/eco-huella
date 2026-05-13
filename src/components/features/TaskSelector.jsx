export default function TaskSelector({ task, onSelect, onClose, currentSelection }) {
  if (!task) return null;

  const calculateImpactPercentage = (current, max = 5.5) => {
    return Math.min((current / max) * 100, 100);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.38)',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        zIndex: 1000,
        animation: 'slideUp 0.3s ease-out'
      }}
      onClick={onClose}
    >
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      <div
        style={{
          background: '#fff',
          borderRadius: '14px',
          border: '0.5px solid #e0e0e0',
          padding: '14px',
          width: '90%',
          maxWidth: '100%',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '4px' }}>
            {task.description}
          </div>
          <div style={{ fontSize: '11px', color: '#999', marginBottom: '8px' }}>
            Registrá tu elección
          </div>
        </div>

        {/* Options */}
        <div>
          {task.options.map((option) => {
            const isSelected = currentSelection?.id === option.id;
            return (
              <div
                key={option.id}
                onClick={() => onSelect(task.id, option)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  border: isSelected ? '2px solid #1D9E75' : '0.5px solid #e0e0e0',
                  borderRadius: '10px',
                  padding: '9px 11px',
                  marginBottom: '7px',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  background: isSelected ? '#f0faf8' : '#fff'
                }}
                onMouseOver={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#d0d0d0';
                    e.currentTarget.style.background = '#fafafa';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.background = '#fff';
                  }
                }}
              >
                {/* Icon */}
                <span style={{ fontSize: '15px', minWidth: '20px' }}>{option.icon}</span>

                {/* Label */}
                <span
                  style={{
                    fontSize: '13px',
                    color: '#333',
                    flex: 1,
                    fontWeight: isSelected ? 500 : 400
                  }}
                >
                  {option.label}
                </span>

                {/* Emissions Badge */}
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 7px',
                    borderRadius: '5px',
                    background:
                      option.impact === 'low' ? '#EAF3DE' : option.impact === 'medium' ? '#FAEEDA' : '#FCEBEB',
                    color:
                      option.impact === 'low' ? '#3B6D11' : option.impact === 'medium' ? '#854F0B' : '#A32D2D',
                    fontWeight: 500,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {option.emissions} kg CO₂
                </span>
              </div>
            );
          })}
        </div>

        {/* Tip Box */}
        {currentSelection && (
          <div
            style={{
              fontSize: '11px',
              color: '#666',
              background: '#f5f5f5',
              borderRadius: '8px',
              padding: '7px 10px',
              marginTop: '12px',
              lineHeight: '1.5',
              borderLeft: '3px solid #1D9E75'
            }}
          >
            💡 <strong>Consejo:</strong> La opción más baja generaría{' '}
            {(
              (task.options
                .filter((o) => o.impact === 'low')
                .reduce((max, o) => Math.max(max, o.emissions), 0) /
                currentSelection.emissions) *
              100
            ).toFixed(0)}
            % menos emisiones
          </div>
        )}

        {/* Comparison Bar */}
        <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '0.5px solid #e0e0e0' }}>
          <div style={{ fontSize: '10px', color: '#999', marginBottom: '8px', fontWeight: 600 }}>
            IMPACTO RELATIVO
          </div>
          {task.options.slice(0, 3).map((option) => (
            <div key={option.id} style={{ marginBottom: '6px' }}>
              <div style={{ fontSize: '10px', color: '#666', marginBottom: '2px' }}>
                {option.icon} {option.label}
              </div>
              <div
                style={{
                  height: '6px',
                  background: '#f0f0f0',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background:
                      option.impact === 'low'
                        ? '#639922'
                        : option.impact === 'medium'
                        ? '#BA7517'
                        : '#E24B4A',
                    width: `${calculateImpactPercentage(option.emissions)}%`,
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '10px',
            marginTop: '12px',
            background: '#1D9E75',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#16885f';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#1D9E75';
          }}
        >
          ✓ Confirmar selección
        </button>
      </div>
    </div>
  );
}
