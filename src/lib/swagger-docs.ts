import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.1.0',
    info: {
      title: 'Striqo Football API',
      version: '1.0.0',
      description: 'API Documentation for the Striqo Football Platform',
      contact: {
        name: 'API Support',
        email: 'support@striqo.com',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Current Environment (relative)',
      },
      {
        url: '/api/v1',
        description: 'V1 API (If versioning prefix is applied)',
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token obtained from /api/auth/login. The authorization header should be: Bearer {token}'
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: { type: 'object' },
            error: { type: 'string' },
            meta: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                timestamp: { type: 'string', format: 'date-time' },
              }
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message description' },
            meta: {
              type: 'object',
              properties: {
                timestamp: { type: 'string', format: 'date-time' }
              }
            }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            role: { type: 'string', enum: ['USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'] },
            status: { type: 'string', enum: ['ACTIVE', 'SUSPENDED', 'BANNED'] },
          }
        }
      }
    },
    security: [
      {
        bearerAuth: [],
      }
    ]
  },
  apis: ['./server.ts', './src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};

export const specs = swaggerJsdoc(options);
