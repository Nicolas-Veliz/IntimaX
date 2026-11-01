
// Comando personalizado de login para IntimaX
Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');

  cy.get('[data-cy="username"]').type(username);
  cy.get('[data-cy="password"]').type(password, { log: false });

  cy.get('[data-cy="login-button"]').click();

  cy.url().should('not.include', '/login');
});
