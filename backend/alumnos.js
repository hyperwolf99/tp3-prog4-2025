import express from "express";
import { db } from "./db.js";
import {
    validarId,
    verificarValidaciones
} from "./validaciones.js";
import { verificarAutenticacion } from "./auth.js";
import { body } from "express-validator";

const router = express.Router();

router.get("/", verificarAutenticacion, async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM alumnos");

    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "No hay alumnos" });
    }

    res.json({
        success: true,
        data: rows
    });
});

// Obtener usuario por ID
router.get(
    "/:id",
    verificarAutenticacion,
    validarId(),
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);

        const [rows] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [
            id,
        ]);

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Alumno no encontrado" });
        }

        res.json({
            success: true,
            data: rows[0],
        })
    }
);

// Crear nuevo alumno
router.post(
    "/",
    [
        body("nombre").isString().notEmpty().withMessage("El nombre es obligatorio"),
        body("apellido").isString().notEmpty().withMessage("El apellido es obligatorio"),
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

        res.json({
            success: true,
            data: {
                id: result.insertId,
                nombre,
                apellido,
                dni
            },
        });
    }
);

// Actualizar alumno
router.put(
    "/:id",
    verificarAutenticacion,
    validarId(),
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const { nombre, apellido, dni } = req.body;

        const [rows] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [
            id,
        ]);
        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Alumno no encontrado" });
        }

        await db.execute(
            "UPDATE alumnos SET nombre = ?, apellido = ?, dni = ? WHERE id = ?",
            [nombre, apellido, dni, id]
        );

        res.json({
            success: true,
            data: { id, nombre, apellido, dni },
        });
    }
);

// Eliminar alumno
router.delete(
    "/:id",
    verificarAutenticacion,
    validarId(),
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);

        const [rows] = await db.execute("SELECT * FROM alumnos WHERE id = ?", [
            id,
        ]);
        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Alumno no encontrado" });
        }

        await db.execute("DELETE FROM alumnos WHERE id = ?", [id]);

        res.json({ success: true, message: "Alumno eliminado" });
    }
);

export default router;
