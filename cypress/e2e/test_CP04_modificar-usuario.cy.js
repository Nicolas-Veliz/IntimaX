describe('CP-04 - Modificación de usuario', () => {

  const timestamp = Date.now();

  const usuarioBase = {
    usuario: `edit_${timestamp}`,
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

      // Obtener las credenciales desde cypress.env.json
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


  it('Debe cargar un usuario existente y permitir modificar sus datos', () => {

    // ---------------------------------------------------------
    // PREPARACIÓN:
    // Crear un usuario exclusivo para esta prueba
    // ---------------------------------------------------------

    cy.contains(/new|add|create/i).click();

    cy.get('input').eq(0).type(usuarioBase.usuario);
    cy.get('input[type="password"]').type(usuarioBase.password, { log: false });
    cy.get('input').eq(2).type(usuarioBase.nombre);
    cy.get('input').eq(3).type(usuarioBase.apellido);
    cy.get('input').eq(4).type(usuarioBase.dni);
    cy.get('input').eq(5).type(usuarioBase.telefono);
    cy.get('input').eq(6).type(usuarioBase.direccion);

    cy.contains('button', /save|submit|create|add/i).click();

    // Comprobar que fue creado
    cy.contains(usuarioBase.dni, { timeout: 8000 })
      .should('be.visible');


    // ---------------------------------------------------------
    // CP-04:
    // MODIFICACIÓN DEL USUARIO
    // ---------------------------------------------------------

    cy.intercept('PUT', '/api/users/*').as('updateUser');
    cy.intercept('GET', '/api/users').as('getUsers');

    // Buscar el usuario recién creado y seleccionarlo
    cy.contains(usuarioBase.dni, { timeout: 8000 })
      .parents('tr')
      .first()
      .click();


    // Verificar que sus datos se cargaron en el formulario
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


    // Guardar las modificaciones
    cy.contains('button', /save/i).click();

    cy.wait('@updateUser');
    cy.wait('@getUsers');


    // Verificar que la modificación se reflejó
    cy.contains('Carlos Alberto', { timeout: 8000 })
      .should('be.visible');

  });

});