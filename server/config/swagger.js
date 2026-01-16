import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AuthBuilder Sentinel API',
      version: '1.0.0',
      description: 'API Documentation for MERN + Spring Boot Authentication System',
      contact: {
        name: 'Sentinel Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:4000',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Look for documentation in these files
  apis: ['./routes/*.js'], 
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;