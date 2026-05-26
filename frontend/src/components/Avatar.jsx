import React from 'react';

function Avatar({ user }) {
  // Obtener iniciales
  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase();
    }
    if (user?.full_name) {
      return user.full_name.charAt(0).toUpperCase();
    }
    return user?.username?.charAt(0).toUpperCase() || 'U';
  };
  
  const initials = getInitials();
  const bgColor = user?.avatar_color || '#e94560';
  
  return (
    <div 
      className="avatar" 
      style={{ 
        backgroundColor: bgColor,
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        fontSize: '18px',
        color: 'white',
        textTransform: 'uppercase'
      }}
    >
      {initials}
    </div>
  );
}

export default Avatar;