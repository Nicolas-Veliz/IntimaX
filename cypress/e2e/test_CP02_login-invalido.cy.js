describe('Pruebas de Validación de Login en IntimaX', () => {
  beforeEach(() => {
    // Ajustar la URL según el puerto donde corre el proyecto localmente
    cy.visit('http://localhost:5173');
  });

  it('Debe mostrar un mensaje de error o rechazar el acceso con credenciales incorrectas', () => {
    // Ingresar usuario incorrecto
    cy.get('[data-cy="username"]').type('usuario_invalido');
    cy.get('[data-cy="password"]').type('clave_erronea');

    // Hacer clic en ingresar
  cy.get('[data-cy="login-button"]').click();

    // Validar que no se redirija al dashboard o que aparezca mensaje de error
    cy.url().should('not.include', '/dashboard');
    // Opcional: validar mensaje de alerta si el sistema lo posee
    // cy.get('.error-message').should('be.visible');
  });
});