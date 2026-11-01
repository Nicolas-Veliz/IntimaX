
describe('CP-07 - Creación de usuario con campos vacíos', () => {

  beforeEach(() => {
    cy.visit('/login');

    cy.env(['username', 'password']).then(({ username, password }) => {
      cy.get('[data-cy="username"]').type(username);
      cy.get('[data-cy="password"]').type(password, { log: false });
    });

    cy.get('[data-cy="login-button"]').click();
    cy.url().should('eq', 'http://localhost:5173/');

    cy.visit('/users');
    cy.url().should('include', '/users');
  });

  it('No debe permitir crear un usuario dejando los campos obligatorios vacíos', () => {

    cy.intercept('POST', '**/api/users').as('createUser');

    cy.get('form.abm-form').within(() => {
      cy.get('button[type="submit"]').click();
    });

    // Verificamos que los campos obligatorios impidan el envío
    cy.get('input[name="username"]').then(($input) => {
      expect($input[0].checkValidity()).to.equal(false);
    });

    // Comprobamos que no se haya enviado una solicitud de creación
    cy.get('@createUser.all').should('have.length', 0);

  });

});
