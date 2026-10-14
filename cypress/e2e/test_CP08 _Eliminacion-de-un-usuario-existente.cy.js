describe("Módulo de Gestión de Usuarios - Eliminación (/users)", () => {
  beforeEach(() => {
    cy.session("sesion-admin", () => {
      cy.visit("/login");

      // Cargar credenciales desde cypress.env.json
      cy.env(["adminUser", "adminPassword"]).then((env) => {
        const adminUser =
          env && typeof env.adminUser === "string" ? env.adminUser : "admin";
        const adminPassword =
          env && typeof env.adminPassword === "string"
            ? env.adminPassword
            : "admin123";

        cy.get(
          'input[type="text"], input[name="username"], input[name="usuario"]',
        )
          .first()
          .type(adminUser);
        cy.get('input[type="password"]').type(adminPassword);
        cy.get('button[type="submit"]').click();
        cy.url().should("not.include", "/login");
      });
    });

    cy.visit("/users");
  });

  it('Debe seleccionar el usuario "prueba", cargar sus datos y confirmando en la modal eliminarlo', () => {
    // 1. CONFIGURAR INTERCEPTACIONES DE RED
    cy.intercept("DELETE", "/api/users/*").as("deleteUser");
    cy.intercept("GET", "/api/users").as("getUsers");

    // 2. BUSCAR Y SELECCIONAR EL USUARIO "prueba" DE LA TABLA
    cy.contains("tr", /prueba/i, { timeout: 8000 })
      .should("be.visible")
      .click();

    // 3. VERIFICAR QUE LOS DATOS DEL USUARIO SE CARGARON EN EL FORMULARIO
    cy.get("input").eq(0).should("have.value", "prueba");

    // 4. PRESIONAR EL BOTÓN INICIAL DE BORRAR / ELIMINAR
    cy.contains("button", /borrar|delete|eliminar/i)
      .should("be.visible")
      .click();

    // 5. INTERACTUAR CON LA MODAL / ALERTA DE CONFIRMACIÓN
    // Hace clic en el botón "Sí, eliminar" de la ventana emergente
    cy.contains("button", /sí, eliminar|si, eliminar|confirmar|sí/i, {
      timeout: 5000,
    })
      .should("be.visible")
      .click();

    // 6. ESPERAR RESPUESTAS DEL BACKEND
    cy.wait("@deleteUser");
    cy.wait("@getUsers");

    // 7. VALIDAR QUE EL USUARIO "prueba" YA NO EXISTE EN LA TABLA
    cy.contains("tr", /prueba/i).should("not.exist");
  });
});
