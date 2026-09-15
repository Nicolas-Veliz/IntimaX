import { Container, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  const teamMembers = [
    { name: 'Veliz Nicolás', role: 'Desarrollador Full Stack' },
    { name: 'Santiago Robles', role: 'Desarrollador Full Stack' },
    { name: 'Bruno Ojeda', role: 'Desarrollador Full Stack' }
  ];

  return (
    <div className="AboutUs" style={{ minHeight: '100vh', background: '#000000', color: '#ffffff', padding: '40px 20px' }}>
      <Container>
        <Row className="justify-content-center text-center mb-4">
          <Col lg={8}>
            <h1 style={{ color: '#E8BA6F', fontWeight: 800, marginBottom: '16px' }}>
              ¡Bienvenidos a IntimaX System!
            </h1>
            <p style={{ color: '#d1d5db', fontSize: '1.05rem', lineHeight: 1.7 }}>
              Somos un equipo de jóvenes y apasionados programadores que creamos y desarrollamos
              una plataforma de gestión hotelera. Nuestro sistema ofrece herramientas de autogestión
              y reservas online para optimizar la administración y mejorar la experiencia de los clientes.
            </p>
          </Col>
        </Row>

        <div style={{ borderTop: '1px solid rgba(232, 186, 111, 0.25)', margin: '32px 0 24px' }} />

        <div className="text-center mb-4">
          <h3 style={{ color: '#E8BA6F', fontWeight: 700 }}>Conoce a nuestro equipo</h3>
        </div>

        <Row className="justify-content-center g-4 mb-4">
          {teamMembers.map((member) => (
            <Col key={member.name} md={4} sm={6} xs={12}>
              <Card
                className="h-100 border-0"
                style={{
                  background: '#111112',
                  border: '1px solid rgba(232, 186, 111, 0.2)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.35)',
                  textAlign: 'center',
                  padding: '20px 12px'
                }}
              >
                <img
                  src="https://media.istockphoto.com/id/1384874531/es/vector/silueta-de-hombre-de-traje-avatar-no-identificado.jpg?s=612x612&w=0&k=20&c=9vuS9E6RA0ZM0oOSxD0zVaxc6DvDwwDCrtYFJrq4sMU="
                  alt={member.name}
                  style={{
                    width: '180px',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    border: '3px solid #E8BA6F'
                  }}
                />
                <Card.Body className="p-0">
                  <Card.Title style={{ color: '#ffffff', marginBottom: '6px' }}>{member.name}</Card.Title>
                  <Card.Text style={{ color: '#C8A46A', marginBottom: 0 }}>{member.role}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            style={{
              background: '#E8BA6F',
              color: '#000000',
              border: 'none',
              borderRadius: '10px',
              padding: '12px 20px',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.5px',
              boxShadow: '0 0 12px rgba(232, 186, 111, 0.25)'
            }}
          >
            VOLVER AL DASHBOARD
          </button>
        </div>
      </Container>
    </div>
  );
};

export default About;