import { Container, Card, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import Navbar from '../components/Navbar';

const teamPhotos = import.meta.glob('../assets/{nicolas,santiago,bruno}.png', {
  eager: true,
  import: 'default',
  query: '?url'
});

const About = () => {
  const navigate = useNavigate();

  const { translations: t } = useLanguage();

  const teamMembers = [
    {
      name: 'Veliz Nicolás',
      photo: teamPhotos['../assets/nicolas.png']
    },
    {
      name: 'Santiago Robles',
      photo: teamPhotos['../assets/santiago.png']
    },
    {
      name: 'Bruno Ojeda',
      photo: teamPhotos['../assets/bruno.png']
    }
  ];

  return (
  <div
    className="AboutUs"
    style={{
      minHeight: '100vh',
      background: '#000000',
      color: '#ffffff'
    }}
  >
    <Navbar
      currentPage="about"
      setCurrentPage={() => {}}
    />

    <Container style={{ padding: '40px 20px' }}>

        <Row className="justify-content-center text-center mb-4">
          <Col lg={8}>

            <h1
              style={{
                color: '#E8BA6F',
                fontWeight: 800,
                marginBottom: '16px'
              }}
            >
              {t.about.welcome}
            </h1>

            <p
              style={{
                color: '#d1d5db',
                fontSize: '1.05rem',
                lineHeight: 1.7
              }}
            >
              {t.about.description}
            </p>

          </Col>
        </Row>

        <div
          style={{
            borderTop: '1px solid rgba(232, 186, 111, 0.25)',
            margin: '32px 0 24px'
          }}
        />

        <div className="text-center mb-4">
          <h3
            style={{
              color: '#E8BA6F',
              fontWeight: 700
            }}
          >
            {t.about.meetTeam}
          </h3>
        </div>

        <Row className="justify-content-center g-4 mb-4">

          {teamMembers.map((member) => (

            <Col
              key={member.name}
              md={4}
              sm={6}
              xs={12}
            >

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

                <div
                  style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    border: '3px solid #E8BA6F',
                    background: '#000000',
                    overflow: 'hidden'
                  }}
                >

                  {member.photo && (

                    <img
                      src={member.photo}
                      alt={member.name}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />

                  )}

                </div>

                <Card.Body className="p-0">

                  <Card.Title
                    style={{
                      color: '#ffffff',
                      marginBottom: '6px'
                    }}
                  >
                    {member.name}
                  </Card.Title>

                  <Card.Text
                    style={{
                      color: '#C8A46A',
                      marginBottom: 0
                    }}
                  >
                    {t.about.developer}
                  </Card.Text>

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
            {t.about.backToDashboard}
          </button>

        </div>

      </Container>
    </div>
  );
};

export default About;