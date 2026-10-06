describe('CP-05 - Validación de campos obligatorios del Login', () => {

    it('No debe permitir iniciar sesión con usuario y contraseña vacíos', () => {

        // Acceder al formulario de inicio de sesión
        cy.visit('/login')

        // Intentar iniciar sesión sin completar los campos
        cy.get('[data-cy="login-button"]').click()

        // Verificar que Usuario sea considerado inválido
        cy.get('[data-cy="username"]')
            .should('match', ':invalid')

        // Verificar que Contraseña sea considerada inválida
        cy.get('[data-cy="password"]')
            .should('match', ':invalid')

        // Verificar que no se haya accedido al sistema
        cy.url()
            .should('include', '/login')

    })

})