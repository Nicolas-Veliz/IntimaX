import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './alerts.css';

import es from '../locales/es';
import en from '../locales/en';


const classes = {
  popup: 'intimax-swal-popup',
  title: 'intimax-swal-title',
  htmlContainer: 'intimax-swal-text',
  confirmButton: 'intimax-swal-confirm',
  cancelButton: 'intimax-swal-cancel'
};


/* ==========================================================
   OBTENER IDIOMA ACTUAL
   ========================================================== */

const getTranslations = () => {
  const language =
    typeof window !== 'undefined'
      ? localStorage.getItem('intimax-language') || 'es'
      : 'es';

  return language === 'en' ? en : es;
};


/* ==========================================================
   ALERTA SIMPLE
   ========================================================== */

export const showAlert = (message, icon = 'info') => {

  const t = getTranslations();

  const alertTitles = {
    success: t.alerts.success,
    error: t.alerts.error,
    warning: t.alerts.warning,
    info: t.alerts.info
  };


  return Swal.fire({
    title:
      alertTitles[icon] ||
      alertTitles.info,

    text: message,

    icon,

    buttonsStyling: false,

    customClass: classes
  });
};


/* ==========================================================
   CONFIRMACIÓN
   ========================================================== */

export const confirmAction = (
  message,
  options = {}
) => {

  const t = getTranslations();


  return Swal.fire({

    title:
      options.title ||
      t.alerts.confirmAction,

    text: message,

    icon:
      options.icon ||
      'warning',

    showCancelButton: true,

    confirmButtonText:
      options.confirmButtonText ||
      t.alerts.yesContinue,

    cancelButtonText:
      options.cancelButtonText ||
      t.alerts.cancel,

    reverseButtons: true,

    buttonsStyling: false,

    customClass: classes

  }).then(
    (result) => result.isConfirmed
  );
};


/* ==========================================================
   SOLICITAR NÚMERO
   ========================================================== */

export const requestNumber = ({
  title,
  text,
  value = 1,
  min = 0.1,
  step = 0.1
}) => {

  const t = getTranslations();


  return Swal.fire({

    title,

    text,

    input: 'number',

    inputValue: value,

    inputAttributes: {
      min,
      step
    },


    inputValidator: (input) => {

      const number = Number(input);

      return Number.isFinite(number) &&
        number > 0

        ? undefined

        : t.alerts.validHours;
    },


    showCancelButton: true,

    confirmButtonText:
      t.alerts.continue,

    cancelButtonText:
      t.alerts.cancel,

    buttonsStyling: false,

    customClass: classes

  }).then(
    (result) =>
      result.isConfirmed
        ? Number(result.value)
        : null
  );
};


/* ==========================================================
   TOAST
   ========================================================== */

export const showToast = (
  message,
  icon = 'success'
) => {

  return Swal.mixin({

    toast: true,

    position: 'top-end',

    showConfirmButton: false,

    timer: 3500,

    timerProgressBar: true,

    iconColor: '#E8BA6F',

    background: '#111112',

    color: '#FFFFFF',

    customClass: {
      popup: 'intimax-swal-toast'
    }

  }).fire({
    icon,
    title: message
  });
};