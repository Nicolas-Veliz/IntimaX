describe('CP-03 - Creación de usuario', () => {

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

      // Las credenciales del administrador se obtienen
      // desde cypress.env.json y no se guardan en el código.
      cy.env(['username', 'password']).then(({ username, password }) => {

        cy.get('[data-cy="username"]')
          .type(username);

        cy.get('[data-cy="password"]')
          .type(password, { log: false });

        cy.get('[data-cy="login-button"]')
          .click();
      });

      cy.url().should('not.include', '/login');
    });

    cy.visit('/users');
  });


  it('Debe crear un usuario ingresando todos los campos requeridos', () => {

    // Abrir el formulario para crear un usuario
    cy.contains(/new|add|create/i).click();

    // Completar los datos del nuevo usuario
    cy.get('input').eq(0).type(usuarioBase.usuario);
    cy.get('input[type="password"]').type(usuarioBase.password, { log: false });
    cy.get('input').eq(2).type(usuarioBase.nombre);
    cy.get('input').eq(3).type(usuarioBase.apellido);
    cy.get('input').eq(4).type(usuarioBase.dni);
    cy.get('input').eq(5).type(usuarioBase.telefono);
    cy.get('input').eq(6).type(usuarioBase.direccion);

    // Guardar el usuario
    cy.contains('button', /save|submit|create|add/i).click();

    // Verificar que el usuario haya sido creado
    cy.contains(usuarioBase.dni, { timeout: 8000 })
      .should('be.visible');
  });

});