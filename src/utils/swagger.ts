import express, { Request, Response } from "express";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const SwaggerOptions: any = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Project Docs",
      version: "1.0.0",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
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
    "./src/routes/v1/schema/*.ts",
    "./src/routes/v1/*.js",
    "./src/routes/v1/access/*.ts",
  ],
};

const swaggerSpec = swaggerJsdoc(SwaggerOptions);

export const swaggerDocs = (app) => {
  // Swagger page
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Docs in JSON format
  app.get("/docs.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });
};
