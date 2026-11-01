
describe('CP-08 - Eliminación de un usuario existente', () => {

  const timestamp = Date.now();

  const usuarioPrueba = {
    username: `eliminar_${timestamp}`,
    password: 'Password123!',
    nombre: 'Usuario',
    apellido: 'Prueba',
    dni: `${Math.floor(10000000 + Math.random() * 90000000)}`,
    telefono: '1198765432',
    direccion: 'Av. Corrientes 1234'
  };

  

beforeEach(() => {

  cy.intercept('POST', '**/api/auth/login').as('loginRequest');

  cy.visit('/login');

  cy.env(['username', 'password']).then(({ username, password }) => {

    cy.get('[data-cy="username"]').type(username);

    cy.get('[data-cy="password"]')
      .type(password, { log: false });

  });

  cy.get('[data-cy="login-button"]').click();

  cy.wait('@loginRequest').then((interception) => {
    cy.log('Estado de respuesta del login:',
      interception.response?.statusCode);
  });

  cy.url().should('not.include', '/login');

  cy.visit('/users');

  cy.url().should('include', '/users');

});



  it('Debe crear un usuario de prueba y eliminarlo correctamente', () => {

    // Creamos un usuario exclusivo para esta prueba
    cy.intercept('POST', '**/api/users').as('createUser');

    cy.get('form.abm-form').within(() => {

      cy.get('input[name="username"]').type(usuarioPrueba.username);
      cy.get('input[name="password"]').type(usuarioPrueba.password, { log: false });
      cy.get('input[name="first_name"]').type(usuarioPrueba.nombre);
      cy.get('input[name="last_name"]').type(usuarioPrueba.apellido);
      cy.get('input[name="dni"]').type(usuarioPrueba.dni);
      cy.get('input[name="phone"]').type(usuarioPrueba.telefono);
      cy.get('input[name="address"]').type(usuarioPrueba.direccion);

      cy.get('button[type="submit"]').click();

    });

    cy.wait('@createUser')
      .its('response.statusCode')
      .should('eq', 201);

    // Comprobamos que aparezca en la tabla
    cy.get('.users-custom-table')
      .contains('td', usuarioPrueba.dni)
      .should('be.visible');

 // Seleccionamos el usuario mediante su DNI
cy.contains('tr', usuarioPrueba.dni)
  .should('be.visible')
  .click();

    // Comprobamos que se haya seleccionado correctamente
    cy.get('input[name="username"]')
      .should('have.value', usuarioPrueba.username);

    // Eliminamos el usuario
    cy.intercept('DELETE', '**/api/users/*').as('deleteUser');

    cy.contains('button', /borrar|delete|eliminar/i)
      .should('be.visible')
      .click();

    // Confirmamos la eliminación
    cy.contains('button', /sí, eliminar|si, eliminar|confirmar|sí/i, {
      timeout: 5000
    })
      .should('be.visible')
      .click();

    cy.wait('@deleteUser')
      .its('response.statusCode')
      .should('be.oneOf', [200, 204]);

    // Verificamos que ya no exista
    cy.get('.users-custom-table')
      .contains('td', usuarioPrueba.dni)
      .should('not.exist');

  });

});
