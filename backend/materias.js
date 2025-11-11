import express from "express";
import { db } from "./db.js";
import {
    validarId,
    verificarValidaciones
} from "./validaciones.js";
import { verificarAutenticacion } from "./auth.js";
import { body } from "express-validator";

const router = express.Router();

// Obtener todas las materias
router.get("/", verificarAutenticacion, async (req, res) => {
    const [rows] = await db.execute("SELECT * FROM materias");

    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "No hay materias" });
    }

    res.status(200).json({
        success: true,
        data: rows
    })
});

// Obtener materia por ID
router.get(
    "/:id",
    verificarAutenticacion,
    validarId(),
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);

        const [rows] = await db.execute("SELECT * FROM materias WHERE id = ?", [
            id,
        ]);
        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Materia no encontrada" });
        }

        res.json({
            success: true,
            data: rows[0],
        })
    }
);

// Crear nueva materia
router.post(
    "/",
    [
        body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
        body("codigo").notEmpty().withMessage("El código es obligatorio"),
        body("año").isInt({ min: 1 }).withMessage("El año debe ser un número entero positivo"),
    ],
    verificarAutenticacion,
    verificarValidaciones,
    async (req, res) => {
        const { nombre, codigo, año } = req.body;

        const [result] = await db.execute(
            "INSERT INTO materias (nombre, codigo, año) VALUES (?, ?, ?)",
            [nombre, codigo, año]
        );

        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                nombre,
                codigo,
                año
            },
        });
    }
);

// Actualizar materia
router.put(
    "/:id",
    verificarAutenticacion,
    validarId(),
    verificarValidaciones,
    async (req, res) => {
        
    }
);

// Eliminar materia
router.delete(
    "/:id",
    verificarAutenticacion,
    validarId(),
    verificarValidaciones,
    async (req, res) => {
        
    }
);

export default router;
