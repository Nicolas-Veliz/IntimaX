describe('Módulo de Gestión de Usuarios (/users)', () => {

  const timestamp = Date.now();
  const usuarioBase = {
    usuario: `user_${timestamp}`,
    password: 'Password123!',
    nombre: 'Carlos',
    apellido: 'Pérez',
    dni: `${Math.floor(10000000 + Math.random() * 90000000)}`,
    telefono: '1198765432',
    direccion: 'Av. Corrientes 1234'
  };

  beforeEach(() => {
    cy.session('sesion-admin', () => {
      cy.visit('/login');
      cy.get('input[type="text"], input[name="username"], input[name="usuario"]').first().type('admin');
      cy.get('input[type="password"]').type('admin123');
      cy.get('button[type="submit"]').click();
      cy.url().should('not.include', '/login');
    });
    cy.visit('/users');
  });

  // -------------------------------------------------------------
  // 1. CREACIÓN DE USUARIO
  // -------------------------------------------------------------
  it('Debe crear un usuario ingresando todos los campos requeridos', () => {
    cy.contains(/new|add|create/i).click();

    cy.get('input').eq(0).type(usuarioBase.usuario);
    cy.get('input[type="password"]').type(usuarioBase.password); 
    cy.get('input').eq(2).type(usuarioBase.nombre);
    cy.get('input').eq(3).type(usuarioBase.apellido);
    cy.get('input').eq(4).type(usuarioBase.dni);
    cy.get('input').eq(5).type(usuarioBase.telefono);
    cy.get('input').eq(6).type(usuarioBase.direccion);

    cy.contains('button', /save|submit|create|add/i).click();

    cy.contains(usuarioBase.dni, { timeout: 8000 }).should('be.visible');
  });

  // -------------------------------------------------------------
  // 2. MODIFICACIÓN DE USUARIO
  // -------------------------------------------------------------
  it('Debe cargar todos los datos del usuario en el formulario y permitir editarlos', () => {
    
    cy.intercept('PUT', '/api/users/*').as('updateUser');
    cy.intercept('GET', '/api/users').as('getUsers');

    cy.contains(usuarioBase.dni, { timeout: 8000 })
      .parents('tr')
      .first()
      .click(); 

    // A. VALIDAR DATOS CARGADOS
    cy.get('input').eq(0).should('have.value', usuarioBase.usuario);
    cy.get('input').eq(1).should('have.value', usuarioBase.nombre);
    cy.get('input').eq(2).should('have.value', usuarioBase.apellido);
    cy.get('input').eq(3).should('have.value', usuarioBase.dni);
    cy.get('input').eq(4).should('have.value', usuarioBase.telefono);
    cy.get('input').eq(5).should('have.value', usuarioBase.direccion);

    // B. MODIFICAR SÓLO LOS CAMPOS DESEADOS
    cy.get('input').eq(1).clear().type('Carlos Alberto'); // Modifica Nombre
    cy.get('input').eq(4).clear().type('1122334455');     // Modifica Teléfono

    // C. GUARDAR LOS CAMBIOS
    cy.contains('button', /save/i).click();

    // Esperar confirmación del backend
    cy.wait('@updateUser');
    cy.wait('@getUsers');

    // D. COMPROBAR QUE LOS CAMBIOS SE REFLEJAN EN LA TABLA VISUALMENTE
    // Solo comprobamos el nombre, ya que el teléfono no se muestra en las columnas de la tabla
    cy.contains('Carlos Alberto', { timeout: 8000 }).should('be.visible');
  });

});