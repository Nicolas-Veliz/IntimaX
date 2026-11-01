
describe('CP-04 - Modificación de usuario', () => {

  const timestamp = Date.now();

  const usuarioBase = {
    usuario: `edit_${timestamp}`,
    nombre: 'Carlos',
    apellido: 'Pérez',
    dni: `${Math.floor(10000000 + Math.random() * 90000000)}`,
    telefono: '1198765432',
    direccion: 'Av. Corrientes 1234'
  };

  beforeEach(() => {

    cy.session('sesion-admin', () => {

      cy.visit('/login');

      // Obtener las credenciales del administrador
      cy.env(['username', 'password']).then(({ username, password }) => {

        if (!username || !password) {
          throw new Error('Faltan las credenciales del administrador en cypress.env.json');
        }

        cy.get('[data-cy="username"]').type(username);
        cy.get('[data-cy="password"]').type(password, { log: false });
        cy.get('[data-cy="login-button"]').click();

      });

      cy.url().should('not.include', '/login');

    });

    cy.visit('/users');

  });

  it('Debe cargar un usuario existente y permitir modificar sus datos', () => {

    // Obtener contraseñas del usuario de prueba
    cy.env(['testUserPassword', 'testUserNewPassword']).then(({ testUserPassword, testUserNewPassword }) => {

      if (!testUserPassword || !testUserNewPassword) {
        throw new Error('Faltan las contraseñas de prueba en cypress.env.json');
      }

      // CREACIÓN DEL USUARIO DE PRUEBA

      cy.contains(/nuevo|new|add|crear|create/i).click();

      cy.get('input').eq(0).type(usuarioBase.usuario);
      cy.get('input[type="password"]').type(testUserPassword, { log: false });
      cy.get('input').eq(2).type(usuarioBase.nombre);
      cy.get('input').eq(3).type(usuarioBase.apellido);
      cy.get('input').eq(4).type(usuarioBase.dni);
      cy.get('input').eq(5).type(usuarioBase.telefono);
      cy.get('input').eq(6).type(usuarioBase.direccion);

      cy.contains('button', /guardar|save|submit|crear|create|add/i).click();

      // Comprobar que el usuario fue creado
      cy.contains(usuarioBase.dni, { timeout: 8000 })
        .should('be.visible');

      // MODIFICACIÓN DEL USUARIO

      cy.intercept('PUT', '**/api/users/*').as('updateUser');
      cy.intercept('GET', '**/api/users').as('getUsers');

      // Seleccionar el usuario creado
      cy.contains(usuarioBase.dni, { timeout: 8000 })
        .parents('tr')
        .first()
        .click();

      // Verificar que los datos se cargaron correctamente
      cy.get('input').eq(0)
        .should('have.value', usuarioBase.usuario);

      cy.get('input').eq(1)
        .should('have.value', usuarioBase.nombre);

      cy.get('input').eq(2)
        .should('have.value', usuarioBase.apellido);

      cy.get('input').eq(3)
        .should('have.value', usuarioBase.dni);

      cy.get('input').eq(4)
        .should('have.value', usuarioBase.telefono);

      cy.get('input').eq(5)
        .should('have.value', usuarioBase.direccion);

      // Modificar nombre y teléfono
      cy.get('input').eq(1)
        .clear()
        .type('Carlos Alberto');

      cy.get('input').eq(4)
        .clear()
        .type('1122334455');

      // Modificar contraseña
      cy.get('input[name="password"]')
        .type(testUserNewPassword, { log: false });

      // Guardar los cambios
      cy.contains('button', /guardar|save/i).click();

      // Comprobar respuesta del servidor
      cy.wait('@updateUser')
        .its('response.statusCode')
        .should('be.oneOf', [200, 204]);

      cy.wait('@getUsers');

      // Verificar que el nombre modificado aparece en la tabla
      cy.contains('Carlos Alberto', { timeout: 8000 })
        .should('be.visible');

      // VERIFICAR LA NUEVA CONTRASEÑA

      cy.request({
        method: 'POST',
        url: 'http://localhost:3000/api/auth/login',
        body: {
          username: usuarioBase.usuario,
          password: testUserNewPassword
        },
        failOnStatusCode: false
      }).its('status').should('eq', 200);

    });

  });

});
