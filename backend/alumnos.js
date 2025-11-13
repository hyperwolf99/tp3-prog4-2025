import express from "express";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import { verificarAutenticacion } from "./auth.js";
import { body, param } from "express-validator";

const router = express.Router();

// Obtener todos los alumnos o buscar por nombre, apellido o DNI
router.get("/", verificarAutenticacion, async (req, res) => {
    const { buscar } = req.query;

    let query = "SELECT * FROM alumnos";
    const params = [];

    if (buscar) {
        query += " WHERE nombre LIKE ? OR apellido LIKE ? OR dni LIKE ?";
        params.push(`%${buscar}%`, `%${buscar}%`, `%${buscar}%`);
    }

    const [rows] = await db.execute(query, params);

    if (rows.length === 0) {
        // Devolvemos un array vacío con éxito si la búsqueda no da resultados
        return res.json({ success: true, data: [] });
    }

    res.json({ success: true, data: rows });
});

// Obtener un alumno por ID
router.get(
    "/:id",
    [param("id").isInt().withMessage("El ID debe ser un número entero")],
    verificarAutenticacion,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);

        // Comprobamos que el alumno exista
        const [rows] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [
            id,
        ]);

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Alumno no encontrado" });
        }
        res.json({ success: true, data: rows[0] });
    }
);

// Crear nuevo alumno
router.post(
    "/",
    [
        body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
        body("apellido").notEmpty().withMessage("El apellido es obligatorio"),
        body("dni").notEmpty().withMessage("El DNI es obligatorio"),
    ],
    verificarAutenticacion,
    verificarValidaciones,
    async (req, res) => {
        const { nombre, apellido, dni } = req.body;

        const [result] = await db.execute(
            "INSERT INTO alumnos (nombre, apellido, dni) VALUES (?, ?, ?)",
            [nombre, apellido, dni]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, nombre, apellido, dni },
        });
    }
);

// Actualizar alumno
router.put(
    "/:id",
    [
        param("id").isInt().withMessage("El ID debe ser un número entero"),
        body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
        body("apellido").notEmpty().withMessage("El apellido es obligatorio"),
        body("dni").notEmpty().withMessage("El DNI es obligatorio"),
    ],
    verificarAutenticacion,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const { nombre, apellido, dni } = req.body;

        await db.execute(
            "UPDATE alumnos SET nombre = ?, apellido = ?, dni = ? WHERE id = ?",
            [nombre, apellido, dni, id]
        );

        res.status(200).json({
            success: true,
            data: { id, nombre, apellido, dni },
        });
    }
);

// Eliminar alumno
router.delete(
    "/:id",
    [param("id").isInt().withMessage("El ID debe ser un número entero")],
    verificarAutenticacion,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);

        // Comprobamos que el alumno exista
        const [rows] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [
            id,
        ]);

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Alumno no encontrado" });
        }

        await db.execute("DELETE FROM alumnos WHERE id = ?", [id]);
        res.json({ success: true, data: { id } });
    }
);

export default router;
