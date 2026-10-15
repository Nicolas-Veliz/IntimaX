describe('CP-07 - Validación de campos obligatorios al crear un usuario', () => {

    beforeEach(() => {

        cy.session('sesion-admin', () => {

            cy.visit('/login');

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


    it('Debe impedir crear un usuario si los campos obligatorios están vacíos', () => {

        cy.intercept('POST', '**/api/users').as('createUser');

        cy.get('form.abm-form').within(() => {
            cy.get('input[required]')
                .should('have.length', 7)
                .each(($input) => {
                    cy.wrap($input).should('match', ':invalid');
                });

            cy.get('button[type="submit"]').click();

            cy.get('input[required]')
                .each(($input) => {
                    cy.wrap($input).should('match', ':invalid');
                });
        });

        cy.get('form.abm-form')
            .should('be.visible');

        cy.url()
            .should('include', '/users');

        cy.get('@createUser.all')
            .should('have.length', 0);
    });

});
