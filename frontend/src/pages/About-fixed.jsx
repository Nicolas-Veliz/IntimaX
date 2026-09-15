import React from 'react';

const Nosotros = () => {
  return (
    <div className="AboutUs">
      {/* Banner */}
      <div
        className="banner bg-success d-flex align-items-center justify-content-center py-4"
      >
        <img
          src="/logo_RHR.jpg"
          alt="Logo INTIMAX"
          className="img-fluid"
          style={{ maxWidth: "180px", height: "auto" }}
        />
      </div>

      <div className="container">
        {/* Descripción */}
        <div className="row text-center my-5">
          <div className="col-lg-8 offset-lg-2">
            <h1 className="display-4 fw-bold mb-4">¡INTIMAX!</h1>

            <p className="lead">
              Somos un equipo de jóvenes y apasionados programadores que
              creamos y desarrollamos una plataforma de gestión hotelera.
              Nuestro sistema ofrece herramientas de autogestión y reservas
              online para optimizar la administración y mejorar la experiencia
              de los clientes.
            </p>
          </div>
        </div>

        <hr className="my-5" />

        {/* Equipo */}
        <div className="row text-center mb-5">
          <div className="col">
            <h2 className="fw-bold">Conoce a nuestro equipo</h2>
          </div>
        </div>

        <div className="row justify-content-center g-4 mb-5">
          {/* Nicolás */}
          <div className="col-lg-4 col-md-6">
            <div className="card shadow-sm h-100 border-0">
              <img
                src="https://media.istockphoto.com/id/1384874531/es/vector/silueta-de-hombre-de-traje-avatar-no-identificado.jpg?s=612x612&w=0&k=20&c=9vuS9E6RA0ZM0oOSxD0zVaxc6DvDwwDCrtYFJrq4sMU="
                alt="Veliz Nicolás"
                className="mx-auto mt-3"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />

              <div className="card-body text-center">
                <h5 className="card-title">Veliz N. Nicolás</h5>
                <p className="card-text">Desarrollador Full Stack</p>
              </div>
            </div>
          </div>

          {/* Santiago */}
          <div className="col-lg-4 col-md-6">
            <div className="card shadow-sm h-100 border-0">
              <img
                src="https://media.istockphoto.com/id/1384874531/es/vector/silueta-de-hombre-de-traje-avatar-no-identificado.jpg?s=612x612&w=0&k=20&c=9vuS9E6RA0ZM0oOSxD0zVaxc6DvDwwDCrtYFJrq4sMU="
                alt="Robles Santiago"
                className="mx-auto mt-3"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />

              <div className="card-body text-center">
                <h5 className="card-title">Robles Santiago</h5>
                <p className="card-text">Desarrollador Full Stack</p>
              </div>
            </div>
          </div>

          {/* Bruno */}
          <div className="col-lg-4 col-md-6">
            <div className="card shadow-sm h-100 border-0">
              <img
                src="https://media.istockphoto.com/id/1384874531/es/vector/silueta-de-hombre-de-traje-avatar-no-identificado.jpg?s=612x612&w=0&k=20&c=9vuS9E6RA0ZM0oOSxD0zVaxc6DvDwwDCrtYFJrq4sMU="
                alt="Ojeda Bruno"
                className="mx-auto mt-3"
                style={{
                  width: "180px",
                  height: "180px",
                  objectFit: "cover",
                  borderRadius: "50%",
                }}
              />

              <div className="card-body text-center">
                <h5 className="card-title">Ojeda Bruno</h5>
                <p className="card-text">Desarrollador Full Stack</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nosotros;
