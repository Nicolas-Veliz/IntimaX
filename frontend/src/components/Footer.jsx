import React from 'react';
import './Footer.css';

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="intimax-footer">
      <div className="footer-main-content">

        {/* SECCIÓN 1: BRANDING (Estilo Mockup) */}
        <div className="footer-section section-brand">
          <h3 className="footer-title">INTIMAX <span className="gold-text">SYSTEM</span></h3>
          <p className="footer-text">Control de Gestión de Albergues Transitorios, desarrollado a medida para optimizar la recepción y el control de turnos en tiempo real.</p>
        </div>

        {/* SECCIÓN 2: SOPORTE / AUTORES (Combinación) */}
        <div className="footer-section section-support">
          <h3 className="footer-title">CONTACT</h3>
          <p className="footer-text">Soporte Técnico Especializado</p>
          <p className="footer-highlight">Comunicate con cualquiera de nuestro Staff</p>
          <p className="footer-subtext">Tucumán, Argentina</p>
        </div>

        {/* SECCIÓN 3: SOBRE NOSOTROS / HISTORIA (Estilo Mockup) */}
        <div className="footer-section section-about">
          <h3 className="footer-title">ABOUT US</h3>
          <p className="footer-text">Somos un grupo de jóvenes programadores dedicados a ofrecerte las mejores soluciones web de alto impacto y rendimiento.</p>
        </div>

      </div>

      {/* LÍNEA DIVISORIA INFERIOR ANTES DE LAS REDES */}
      <div className="footer-divider"></div>

      <div className="footer-bottom-bar">
        {/* COPYRIGHT IZQUIERDO */}
        <div className="copyright-text">
          &copy; {currentYear} Intimax System. All Rights Reserved. <span className="version-tag">v1.2.0 - Premium</span>
        </div>

        {/* SOCIAL MEDIA DERECHO: Minimalista con 2 Redes */}
        <div className="footer-social">
          <a href="#" className="social-icon-link" title="Instagram">
            <span className="social-text">Instagram</span>
          </a>
          <a href="#" className="social-icon-link" title="Facebook">
            <span className="social-text">Facebook</span>
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;