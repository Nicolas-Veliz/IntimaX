import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import './alerts.css';

const classes = {
  popup: 'intimax-swal-popup',
  title: 'intimax-swal-title',
  htmlContainer: 'intimax-swal-text',
  confirmButton: 'intimax-swal-confirm',
  cancelButton: 'intimax-swal-cancel'
};

const alertTitles = {
  success: 'Operación completada',
  error: 'Ocurrió un error',
  warning: 'Atención',
  info: 'Información'
};

export const showAlert = (message, icon = 'info') => Swal.fire({
  title: alertTitles[icon] || alertTitles.info,
  text: message,
  icon,
  buttonsStyling: false,
  customClass: classes
});

export const confirmAction = (message, options = {}) => Swal.fire({
  title: options.title || 'Confirmar acción',
  text: message,
  icon: options.icon || 'warning',
  showCancelButton: true,
  confirmButtonText: options.confirmButtonText || 'Sí, continuar',
  cancelButtonText: options.cancelButtonText || 'Cancelar',
  reverseButtons: true,
  buttonsStyling: false,
  customClass: classes
}).then((result) => result.isConfirmed);

export const requestNumber = ({ title, text, value = 1, min = 0.1, step = 0.1 }) => Swal.fire({
  title,
  text,
  input: 'number',
  inputValue: value,
  inputAttributes: { min, step },
  inputValidator: (input) => {
    const number = Number(input);
    return Number.isFinite(number) && number > 0
      ? undefined
      : 'Ingrese una cantidad de horas válida.';
  },
  showCancelButton: true,
  confirmButtonText: 'Continuar',
  cancelButtonText: 'Cancelar',
  buttonsStyling: false,
  customClass: classes
}).then((result) => result.isConfirmed ? Number(result.value) : null);

export const showToast = (message, icon = 'success') => Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3500,
  timerProgressBar: true,
  iconColor: '#E8BA6F',
  background: '#111112',
  color: '#FFFFFF',
  customClass: { popup: 'intimax-swal-toast' }
}).fire({ icon, title: message });