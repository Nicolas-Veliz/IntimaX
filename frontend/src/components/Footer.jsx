import React from 'react';
import './Footer.css';
import { useLanguage } from '../contexts/LanguageContext';

function WhatsAppIcon() {
  return (
    <svg
      className="whatsapp-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12.04 2C6.55 2 2.09 6.45 2.09 11.94c0 1.75.46 3.46 1.33 4.97L2 22l5.23-1.37a9.9 9.9 0 0 0 4.8 1.22h.01c5.49 0 9.95-4.45 9.95-9.94C21.99 6.45 17.53 2 12.04 2Zm0 18.18h-.01a8.2 8.2 0 0 1-4.18-1.14l-.3-.18-3.1.81.83-3.02-.2-.31a8.2 8.2 0 1 1 6.96 3.84Zm4.5-6.13c-.25-.12-1.46-.72-1.69-.8-.23-.08-.4-.12-.56.12-.17.25-.65.8-.79.97-.15.16-.29.18-.54.06-.25-.12-1.04-.38-1.99-1.22-.73-.65-1.23-1.46-1.37-1.71-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.16-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.16 0-.43.06-.66.31-.23.25-.87.85-.87 2.07s.89 2.4 1.01 2.57c.12.16 1.75 2.67 4.24 3.75.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.46-.6 1.67-1.17.21-.58.21-1.07.15-1.17-.06-.11-.23-.17-.48-.29Z"
      />
    </svg>
  );
}

function Footer() {
  const { translations: t } = useLanguage();

  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact-footer" className="intimax-footer">
      <div className="footer-main-content">

        {/* SECCIÓN 1: BRANDING */}
        <div className="footer-section section-brand">
          <h3 className="footer-title">
            INTIMAX <span className="gold-text">SYSTEM</span>
          </h3>

          <p className="footer-text">
            {t.footer.systemDescription}
          </p>
        </div>

        {/* SECCIÓN 2: CONTACTO */}
        <div className="footer-section section-support">
          <h3 className="footer-title">
            {t.footer.contact}
          </h3>

          <p className="footer-text">
            {t.footer.technicalSupport}
          </p>

          <p className="footer-highlight">
            {t.footer.contactStaff}
          </p>

          <div className="whatsapp-team">

            <a
              href="https://wa.me/5493815243788"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-contact"
              aria-label={`${t.footer.whatsappContact} Veliz Nicolás`}
            >
              <WhatsAppIcon />
              <span>Veliz Nicolás</span>
            </a>

            <a
              href="https://wa.me/5493816147188"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-contact"
              aria-label={`${t.footer.whatsappContact} Robles Santiago`}
            >
              <WhatsAppIcon />
              <span>Robles Santiago</span>
            </a>

            <a
              href="https://wa.me/5493816774529"
              target="_blank"
              rel="noopener noreferrer"
              className="whatsapp-contact"
              aria-label={`${t.footer.whatsappContact} Ojeda Bruno`}
            >
              <WhatsAppIcon />
              <span>Ojeda Bruno</span>
            </a>

          </div>

          <p className="footer-subtext">
            {t.footer.location}
          </p>
        </div>

        {/* SECCIÓN 3: SOBRE NOSOTROS */}
        <div className="footer-section section-about">
          <h3 className="footer-title">
            {t.footer.aboutUs}
          </h3>

          <p className="footer-text">
            {t.footer.aboutDescription}
          </p>
        </div>

      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom-bar">
        <div className="copyright-text">
          &copy; {currentYear} Intimax System. {t.footer.allRightsReserved}

          <span className="version-tag">
            v1.2.0 - Premium
          </span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;