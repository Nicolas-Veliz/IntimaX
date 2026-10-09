import React, { useState, useEffect } from 'react';
import './navbar.css';

import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

import { useNavigate } from 'react-router-dom';

import logoIntimax_Texto from '../assets/logo-texto.png';

import { confirmAction } from '../services/alerts';


const navIconPaths = {
  rooms: (
    <>
      <path d="M2 4v16M2 8h18a2 2 0 0 1 2 2v10M2 17h20M6 8v9" />
    </>
  ),

  contact: (
    <>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.4 2.8a2 2 0 0 1-.57 1.7L7.1 10.06a16 16 0 0 0 6 6l1.84-1.84a2 2 0 0 1 1.7-.57l2.8.4a2 2 0 0 1 1.72 1.87Z" />
    </>
  ),

  about: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </>
  ),

  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6M23 11h-6" />
    </>
  ),

  reports: (
    <>
      <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3" />
    </>
  ),

  clock: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </>
  ),

  exit: (
    <>
      <path d="M14 17l5-5-5-5M19 12H8M3 5v14a2 2 0 0 0 2 2h6" />
    </>
  ),
};


function NavIcon({
  name,
  size = 16,
  color = '#B11226'
}) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      style={{
        flex: 'none',
        verticalAlign: 'middle'
      }}
    >
      {navIconPaths[name]}
    </svg>
  );
}


export const Navbar = ({
  currentPage,
  setCurrentPage
}) => {

  const [hora, setHora] = useState('');

  const { user, logout } = useAuth();

  const {
    language,
    changeLanguage,
    translations: t
  } = useLanguage();

  const navigate = useNavigate();


  useEffect(() => {

    const actualizarReloj = () => {

      const ahora = new Date();

      const horaFormateada =
        ahora.toLocaleTimeString(
          'es-AR',
          {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }
        );

      setHora(horaFormateada);
    };


    actualizarReloj();

    const intervalo =
      setInterval(
        actualizarReloj,
        1000
      );


    return () =>
      clearInterval(intervalo);

  }, []);


  const handleNavigation = (
    page,
    path
  ) => {

    setCurrentPage?.(page);

    if (path) {
      navigate(path);
    }
  };


  const handleContactClick = () => {

    const footer =
      document.getElementById(
        'contact-footer'
      );

    if (footer) {

      footer.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });

    }
  };


  const handleLogout = async () => {

    const confirmed =
      await confirmAction(
        t.alerts.logoutMessage,
        {
          title:
            t.alerts.logoutTitle,

          confirmButtonText:
            t.alerts.yesLogout
        }
      );


    if (confirmed) {

      logout();

      window.location.href =
        '/login';
    }
  };


  return (

    <header
      className={`dashboard-header ${
        user?.role !== 'admin'
          ? 'is-receptionist'
          : ''
      }`}
    >

      {/* ==============================
          NAVEGACIÓN IZQUIERDA
          ============================== */}

      <div className="nav-group-left">

        <button
          className={`nav-btn ${
            currentPage === 'rooms'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            handleNavigation(
              'rooms',
              '/'
            )
          }
        >
          <NavIcon name="rooms" />

          <span>
            {t.nav.rooms}
          </span>
        </button>


        <button
          className="nav-btn"
          onClick={handleContactClick}
        >
          <NavIcon name="contact" />

          <span>
            {t.nav.contact}
          </span>
        </button>

      </div>


      {/* ==============================
          LOGO CENTRAL
          ============================== */}

      <div className="header-center-logo">

        <img
          src={logoIntimax_Texto}
          alt="Intimax System"
          className="logo-text-img-only"
        />

      </div>


      {/* ==============================
          NAVEGACIÓN DERECHA
          ============================== */}

      <div className="nav-group-right">

        {/* ABOUT */}

        <button
          className={`nav-btn ${
            currentPage === 'about'
              ? 'active'
              : ''
          }`}
          onClick={() =>
            handleNavigation(
              'about',
              '/about'
            )
          }
        >
          <NavIcon name="about" />

          <span>
            {t.nav.about}
          </span>
        </button>


        {/* OPCIONES SOLO ADMIN */}

        {user?.role === 'admin' && (

          <>

            <button
              className={`nav-btn ${
                currentPage === 'users'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                handleNavigation(
                  'users',
                  '/users'
                )
              }
            >
              <NavIcon name="users" />

              <span>
                {t.nav.users}
              </span>
            </button>


            <button
              className={`nav-btn ${
                currentPage === 'reports'
                  ? 'active'
                  : ''
              }`}
              onClick={() =>
                handleNavigation(
                  'reports',
                  '/reports'
                )
              }
            >
              <NavIcon name="reports" />

              <span>
                {t.nav.reports}
              </span>
            </button>

          </>

        )}

      </div>


      {/* ==============================
          ESTADO DE CUENTA
          ============================== */}

      <div className="header-right-status">

        {/* RELOJ */}

        <div className="time-display">

          <NavIcon name="clock" />

          <span className="time-text">
            {hora || t.nav.loading}
          </span>

        </div>


        {/* SELECTOR DE IDIOMA */}

        <div className="language-selector">

          <span className="language-globe">
            🌐
          </span>


          <button
            type="button"
            className={`language-option ${
              language === 'es'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              changeLanguage('es')
            }
            title="Español"
          >
            ES
          </button>


          <span className="language-divider">
            |
          </span>


          <button
            type="button"
            className={`language-option ${
              language === 'en'
                ? 'active'
                : ''
            }`}
            onClick={() =>
              changeLanguage('en')
            }
            title="English"
          >
            EN
          </button>

        </div>


        {/* AVATAR */}

        <div className="user-profile-wrapper">

          <div className="user-avatar-circle">

            {user?.username ? (

              user.username
                .split(' ')
                .map(
                  (name) => name[0]
                )
                .join('')
                .toUpperCase()
                .substring(0, 2)

            ) : (

              user?.role === 'admin'
                ? 'SR'
                : 'RE'

            )}

          </div>


          <div className="user-info-sub">

            <span className="user-role-sub">

              {user?.role
                ? user.role.toUpperCase()
                : 'USER'}

            </span>

          </div>

        </div>


        {/* SALIR / EXIT */}

        <button
          className="logout-btn"
          onClick={handleLogout}
          title={t.nav.exit}
        >

          <NavIcon
            name="exit"
            color="#C8A46A"
          />

          <span>
            {t.nav.exit}
          </span>

        </button>

      </div>

    </header>

  );
};


export default Navbar;