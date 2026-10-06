describe('CP-06 - Acceso a /users sin autenticación', () => {

    it('Debe impedir el acceso a /users si el usuario no inició sesión', () => {

        // Eliminar cualquier sesión o dato de autenticación existente
        cy.clearCookies()
        cy.clearLocalStorage()

        // Intentar acceder directamente a una ruta protegida
        cy.visit('/users')

        // Verificar que el sistema redirija al Login
        cy.url()
            .should('include', '/login')

        // Verificar que se muestre el formulario de inicio de sesión
        cy.get('[data-cy="username"]')
            .should('be.visible')

        cy.get('[data-cy="password"]')
            .should('be.visible')

        cy.get('[data-cy="login-button"]')
            .should('be.visible')

    })

})