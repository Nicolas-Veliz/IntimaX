const es = {
  language: {
    spanish: 'Español',
    english: 'Inglés',
    shortSpanish: 'ES',
    shortEnglish: 'EN'
  },

  nav: {
    rooms: 'HABITACIONES',
    contact: 'CONTACTO',
    about: 'NOSOTROS',
    users: 'USUARIOS',
    reports: 'REPORTES',
    exit: 'SALIR',
    loading: 'Cargando...'
  },

  login: {
    username: 'Usuario',
    usernamePlaceholder: 'Ingrese su usuario',
    password: 'Contraseña',
    passwordPlaceholder: 'Ingrese su contraseña',
    showPassword: 'Mostrar contraseña',
    login: 'INGRESAR',
    loggingIn: 'Ingresando...',
    invalidCredentials: 'Usuario o contraseña incorrectos',
    ourClients: 'Nuestros Clientes',
    previousClient: 'Cliente anterior',
    nextClient: 'Cliente siguiente',
    client: 'Cliente'
  },

  footer: {
    systemDescription:
      'Control de Gestión de Albergues Transitorios, desarrollado a medida para optimizar la recepción y el control de turnos en tiempo real.',

    contact: 'CONTACTO',
    technicalSupport: 'Soporte Técnico Especializado',
    contactStaff: 'Comunicate con cualquiera de nuestro Staff',

    aboutUs: 'SOBRE NOSOTROS',
    aboutDescription:
      'Somos un grupo de jóvenes programadores dedicados a ofrecerte las mejores soluciones web de alto impacto y rendimiento.',

    whatsappContact: 'Contactar por WhatsApp a',
    location: 'Tucumán, Argentina',
    allRightsReserved: 'Todos los derechos reservados.'
  },

  dashboard: {
    rooms: 'HABITACIONES',
    totalRooms: 'HABITACIONES TOTALES',
    occupiedRooms: 'OCUPADAS',
    availableRooms: 'DISPONIBLES',
    incomeToday: 'INGRESOS HOY',

    administer: 'ADMINISTRAR',
    update: 'ACTUALIZAR',

    available: 'DISPONIBLE',
    occupied: 'OCUPADO',
    cleaning: 'LIMPIEZA',
    maintenance: 'MANTENIMIENTO',

    timeExpired: 'TIEMPO EXPIRADO',
    start: 'INICIAR',
    finish: 'FINALIZAR',
    markReady: 'MARCAR LISTA',
    cleaningInProgress: 'LIMPIANDO',

    newShift: 'Nuevo turno',
    currentShift: 'Turno actual',
    startShift: 'Iniciar turno',
    finishShift: 'Finalizar turno',
    extendShift: 'Extender turno',

    room: 'Habitación',
    roomType: 'Tipo de habitación',
    price: 'Precio',
    duration: 'Duración',
    hours: 'horas',

    paymentMethod: 'Método de pago',
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',

    total: 'Total',
    cancel: 'Cancelar',
    confirm: 'Confirmar',

    roomAvailable: 'Habitación disponible',
    roomOccupied: 'Habitación ocupada',
    roomCleaning: 'Habitación en limpieza',

    noRooms: 'No hay habitaciones registradas.'

  },

  roomTile: {
    available: 'Disponible',
    occupied: 'Ocupado',
    cleaning: 'Limpieza',
    maintenance: 'Mantenimiento',
    charge: 'Cobrar',
    markClean: 'Marcar Limpia'
  },

  quickStats: {
    occupancy: 'Ocupación',
    occupied: 'ocupado',
    dailyCash: 'Caja del día',
    cash: 'Efectivo',
    toClean: 'Por limpiar',
    rooms: 'habitaciones',
    turnover: 'Rotación',
    timesPerDay: 'veces/día'
  },

  users: {
    managementPanel: 'PANEL DE GESTIÓN: USUARIOS / PERSONAL',
    backToPanel: 'VOLVER AL PANEL',

    editStaff: 'Editar Personal',
    registerStaff: 'Registrar / Modificar Personal',

    user: 'USUARIO',
    password: 'CONTRASEÑA',
    firstName: 'NOMBRE/S',
    lastName: 'APELLIDO',
    shift: 'TURNO',
    dni: 'DNI',
    phone: 'TELÉFONO',
    address: 'DIRECCIÓN',
    role: 'ROL',

    usernamePlaceholder: 'Ej: juanperez',
    passwordPlaceholder: 'Ingrese una contraseña',
    firstNamePlaceholder: 'Ej: JUAN',
    lastNamePlaceholder: 'Ej: PÉREZ',
    dniPlaceholder: 'Ej: XX.XX.XX',
    phonePlaceholder: 'Ej: 3811234567',
    addressPlaceholder: 'Ej: SAN JUAN 350',

    morning: 'Mañana',
    afternoon: 'Tarde',
    night: 'Noche',

    receptionist: 'Recepcionista',
    supervisor: 'Supervisor',
    admin: 'Administrador',
    userRole: 'Usuario',

    save: 'GUARDAR',
    create: 'CREAR',
    cancel: 'CANCELAR',
    clear: 'LIMPIAR',
    delete: 'ELIMINAR',

    registeredUsers: 'Lista de Usuarios Registrados',
    loadingUsers: 'Cargando usuarios...',
    noUsers: 'No hay usuarios registrados.',

    name: 'Nombre',
    lastNameTable: 'Apellido',
    shiftTable: 'Turno',
    permitRole: 'Permiso (Rol)',

    tableHint:
      '💡 Hacé clic en una fila de la tabla para cargar los datos en el formulario y poder modificarlos o eliminarlos.',

    requiredPassword:
      'La contraseña es obligatoria para crear un usuario.',

    loadError:
      'No se pudieron cargar los usuarios desde la base de datos.',

    saveError: 'Error al guardar usuario',
    deleteError: 'Error al eliminar usuario',

    deleteUser: 'Eliminar usuario',
    yesDelete: 'Sí, eliminar',

    fullName: 'Nombre Completo',
    status: 'Estado',
    actions: 'Acciones',
    active: 'Activo',
    inactive: 'Inactivo',

    newReceptionist: 'NUEVO RECEPCIONISTA',
    editReceptionist: 'EDITAR RECEPCIONISTA',
    receptionistManagement: 'GESTIÓN DE RECEPCIONISTAS',
    createUser: 'CREAR USUARIO',
    updateUser: 'ACTUALIZAR'
  },

  reports: {
    title: 'REPORTES Y AUDITORÍA',

    description:
      'Resumen operativo del día, ingresos, pagos, sesiones y caja.',

    backToDashboard: 'VOLVER AL DASHBOARD',

    loading: 'Cargando reportes...',
    loadError: 'No se pudieron cargar los reportes del sistema.',

    totalIncomeToday: 'Ingreso total del día',
    mostUsedPayment: 'Método de pago más usado',
    mostUsedRoom: 'Habitación más usada',
    sessionControl: 'Control de sesiones',

    noPayments: 'Sin pagos',
    noData: 'Sin datos',

    records: 'registros',
    shifts: 'turnos',

    incomeDetail: 'Detalle de ingresos',
    date: 'Fecha',
    shiftsTitle: 'Turnos',
    income: 'Ingreso',
    cash: 'Efectivo',
    card: 'Tarjeta',
    transfer: 'Transferencia',

    noIncomeRecords: 'No hay registros de ingreso.',

    cashHistory: 'Historial de caja',

    sessions: 'Sesiones',
    average: 'Promedio',
    staff: 'Personal',

    user: 'Usuario',
    lastLogin: 'Último ingreso',
    lastLogout: 'Última salida',
    averageConnected: 'Promedio conectado',

    noSessions: 'No hay sesiones registradas.',

    staffHistory: 'Historial de personal',
    person: 'Persona',
    action: 'Acción',
    duration: 'Duración',

    login: 'Ingreso',
    logout: 'Salida',

    noStaffHistory:
      'No hay historial de personal disponible.',

    activityReports: 'REPORTES DE ACTIVIDAD',
    dateFrom: 'Fecha desde',
    dateTo: 'Fecha hasta',
    receptionist: 'Recepcionista',
    all: 'Todos',
    filter: 'FILTRAR',

    receptionistSummary: 'RESUMEN POR RECEPCIONISTA',
    logins: 'ingresos',
    last: 'Último',
    never: 'Nunca',

    detailedLog: 'REGISTRO DETALLADO',
    dateAndTime: 'Fecha y Hora',

    noRecords:
      'No hay registros en el período seleccionado'
  },

  about: {
    welcome: '¡Bienvenidos a IntimaX System!',

    description:
      'Somos un equipo de jóvenes y apasionados programadores que creamos y desarrollamos una plataforma de gestión hotelera. Nuestro sistema ofrece herramientas de autogestión y reservas online para optimizar la administración y mejorar la experiencia de los clientes.',

    meetTeam: 'Conocé a nuestro equipo',
    developer: 'Desarrollador Full Stack',
    backToDashboard: 'VOLVER AL DASHBOARD'
  },

  amenities: {
    title: 'AMENITIES',

    loading: 'Cargando amenities...',

    add: 'Agregar',
    adding: 'Agregando...',
    delete: 'Eliminar',
    edit: 'Editar',
    new: 'Nuevo',
    save: 'Guardar',
    update: 'Actualizar',
    cancel: 'Cancelar',

    currentTotal: 'Total actual',

    lowStock: 'producto(s) con bajo stock',

    consumedInRoom: 'Consumidos en esta habitación',

    stock: 'Stock',
    minimumStockAlert: 'Alerta de stock mínimo',

    category: 'Categoría',
    name: 'Nombre',
    description: 'Descripción',
    price: 'Precio',

    drinks: 'Bebidas',
    food: 'Comidas',
    hygiene: 'Higiene',
    entertainment: 'Entretenimiento',
    others: 'Otros',

    room: 'Hab.',

    addConsumption: 'Agregar consumo',
    removeConsumption: 'Quitar consumo',

    yesAdd: 'Sí, agregar',
    yesRemove: 'Sí, quitar',

    noActiveShift:
      'No hay un turno activo para esta habitación',

    saveError:
      'Error al guardar el amenity',

    deleteError:
      'Error al eliminar',

    addError:
      'No se pudo agregar el amenity a la habitación',

    removeError:
      'No se pudo eliminar el consumo',

    deleteAmenityQuestion:
      '¿Estás seguro de eliminar este amenity?',

    deleteAmenityTitle:
      'Eliminar amenity',

    receipt: 'Comprobante de consumo',

    roomLabel: 'Habitación',
    type: 'Tipo',
    date: 'Fecha',

    roomPrice: 'Precio habitación',
    product: 'Producto',
    productPrice: 'Precio producto',

    total: 'Total',

    thanks: 'Gracias por elegir INTIMAX.',

    printBlocked:
      'El navegador bloqueó la ventana de impresión'
  },

  alerts: {
    success: 'Operación completada',
    error: 'Ocurrió un error',
    warning: 'Atención',
    info: 'Información',

    confirmAction: 'Confirmar acción',

    yesContinue: 'Sí, continuar',
    cancel: 'Cancelar',
    continue: 'Continuar',

    validHours:
      'Ingrese una cantidad de horas válida.',

    logoutTitle: 'Cerrar sesión',

    logoutMessage:
      '¿Está seguro de que desea salir del sistema?',

    yesLogout: 'Sí, salir'
  },

  common: {
    yes: 'Sí',
    no: 'No',
    loading: 'Cargando...',
    error: 'Error',
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    create: 'Crear',
    update: 'Actualizar',

    minute: 'minuto',
    minutes: 'minutos',
    hour: 'hora',
    hours: 'horas',

    room: 'Habitación',
    rooms: 'Habitaciones'
  }
};

export default es;