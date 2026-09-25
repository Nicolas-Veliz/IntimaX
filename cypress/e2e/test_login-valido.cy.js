describe('Pruebas E2E - IntimaX', () => {

    it('Debe mostrar correctamente el formulario de inicio de sesión', () => {

        cy.visit('http://localhost:5173/login')

        cy.get('[data-cy="username"]')
            .should('be.visible')

        cy.get('[data-cy="password"]')
            .should('be.visible')

        cy.get('[data-cy="login-button"]')
            .should('be.visible')

    })


    it('Debe iniciar sesión correctamente con credenciales válidas', () => {

        cy.visit('http://localhost:5173/login')

        cy.env(['username', 'password']).then(({ username, password }) => {

            cy.get('[data-cy="username"]')
                .type(username)

            cy.get('[data-cy="password"]')
                .type(password, { log: false })

        })

        cy.get('[data-cy="login-button"]')
            .click()

        cy.url()
            .should('eq', 'http://localhost:5173/')

        cy.contains('ROOMS')
            .should('be.visible')

    })

})