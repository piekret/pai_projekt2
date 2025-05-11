export const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Projekt 2 Swagger",
      version: "Iamcominglouis",
      description: "🥀🥀🥀",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        CreateVisitDTO: {
          type: "object",
          properties: {
            visitorName: {
              type: "string",
              minLength: 2,
              example: "Jan Wieprzowina",
            },
            visitDate: {
              type: "string",
              format: "date",
              example: "2025-05-11",
            },
          },
          required: ["visitorName", "visitDate"],
        },
        UpdateVisitDTO: {
          type: "object",
          properties: {
            visitorName: {
              type: "string",
              minLength: 2,
              example: "Jan Wieprzowina",
            },
            visitDate: {
              type: "string",
              format: "date",
              example: "2025-05-11",
            },
          },
        },
        CreateStaffDTO: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 2,
              example: "Jan Sigma",
            },
            email: {
              type: "string",
              format: "email",
              example: "jan.sigma@wp.pl",
            },
            password: {
              type: "string",
              minLength: 8,
              example: "qwertyuiop",
            },
            role: {
              type: "string",
              enum: ["guard", "admin", "medic"],
              example: "guard",
            },
          },
          required: ["name", "email", "password", "role"],
        },
        LoginStaffDTO: {
          type: "object",
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "jan.sigma@wpl.pl",
            },
            password: {
              type: "string",
              minLength: 8,
              example: "qwertyuiop",
            },
          },
          required: ["email", "password"],
        },
        UpdateStaffDTO: {
          type: "object",
          properties: {
            name: {
              type: "string",
              minLength: 2,
              example: "Jan Zmiana",
            },
            email: {
              type: "string",
              format: "email",
              example: "skbidi@proton.me",
            },
            password: {
              type: "string",
              minLength: 8,
              example: "asdfghjkl",
            },
            role: {
              type: "string",
              enum: ["guard", "admin", "medic"],
              example: "medic",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    "src/staff/controllers/*.ts",
    "src/inmates/controllers/*.ts"
  ],
};
