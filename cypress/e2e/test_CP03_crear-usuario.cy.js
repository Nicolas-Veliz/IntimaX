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

    cy.intercept('POST', '**/api/users').as('createUser');

    cy.get('form.abm-form').within(() => {
      cy.get('input[name="username"]').type(usuarioBase.usuario);
      cy.get('input[name="password"]').type(usuarioBase.password, { log: false });
      cy.get('input[name="first_name"]').type(usuarioBase.nombre);
      cy.get('input[name="last_name"]').type(usuarioBase.apellido);
      cy.get('input[name="dni"]').type(usuarioBase.dni);
      cy.get('input[name="phone"]').type(usuarioBase.telefono);
      cy.get('input[name="address"]').type(usuarioBase.direccion);

      cy.get('button[type="submit"]').click();
    });

    cy.wait('@createUser')
      .its('response.statusCode')
      .should('eq', 201);

    // Verificar que el usuario haya sido creado
    cy.get('.users-custom-table')
      .contains('td', usuarioBase.dni, { timeout: 8000 })
      .should('be.visible');
  });

});