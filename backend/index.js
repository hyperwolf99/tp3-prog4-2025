import express from "express";
import { conectarDB } from "./db.js";
import usuariosRouter from "./usuarios.js";
import authRouter, { authConfig } from "./auth.js";
import alumnosRouter from "./alumnos.js";
import materiasRouter from "./materias.js";
import cors from "cors";

conectarDB();

// Inicializar la aplicación
const app = express();
const port = 3000;

// Middleware para parsear JSON
app.use(express.json());

// Ruta principal
app.get("/", (req, res) => {
    // Responde con string
    res.send("Hola Mundo!");
});

// Habilito CORS
app.use(cors())

authConfig();

// Usar el enrutador de usuarios
app.use("/usuarios", usuariosRouter);
app.use("/auth", authRouter);
app.use("/alumnos", alumnosRouter);
app.use("/materias", materiasRouter);

// Iniciar el servidor
app.listen(port, () => {
    console.log(`La aplicación está funcionando en el puerto ${port}`);
});
