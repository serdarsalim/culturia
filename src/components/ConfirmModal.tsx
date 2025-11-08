'use client';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = '#dc2626',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 16px 24px',
          borderBottom: '1px solid #27272a',
        }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: 'white',
            margin: 0,
          }}>
            {title}
          </h3>
        </div>

        {/* Body */}
        <div style={{
          padding: '24px',
          color: '#a1a1aa',
          fontSize: '14px',
          lineHeight: '1.6',
          whiteSpace: 'pre-line',
        }}>
          {message}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #27272a',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: '#27272a',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.background = '#3f3f46'}
            onMouseOut={(e) => e.currentTarget.style.background = '#27272a'}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              background: confirmColor,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => {
              const color = confirmColor;
              // Darken the color on hover
              e.currentTarget.style.background = color.replace(/[0-9a-f]{2}$/i, (m) =>
                (parseInt(m, 16) * 0.8).toString(16).padStart(2, '0')
              );
            }}
            onMouseOut={(e) => e.currentTarget.style.background = confirmColor}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
