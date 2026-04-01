const swaggerJsdoc = require('swagger-jsdoc');
const path = require('path');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description:
        'A comprehensive finance data processing and access control backend API with role-based access control (RBAC). Built with Node.js, Express, and MongoDB.',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5001}`,
        description: process.env.RENDER_EXTERNAL_URL ? 'Production server (Render)' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from the login endpoint',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Authentication', description: 'User registration and login' },
      { name: 'Users', description: 'User management (Admin only)' },
      {
        name: 'Financial Records',
        description: 'Financial record CRUD operations',
      },
      {
        name: 'Dashboard',
        description: 'Dashboard analytics and summary endpoints',
      },
    ],
  },
  apis: [
    path.join(__dirname, '../controllers/*.js'),
    path.join(__dirname, '../routes/*.js'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
