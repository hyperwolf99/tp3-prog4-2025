import express from "express";
import bcrypt from "bcrypt";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import { verificarAutenticacion } from "./auth.js";
import { body, param } from "express-validator";

const router = express.Router();

// Obtener todos los usuarios o buscar por nombre
router.get("/", verificarAutenticacion, async (req, res) => {
    const { buscar } = req.query;

    let query = "SELECT id, nombre, email FROM usuarios";
    const params = [];

    if (buscar) {
        query += " WHERE nombre LIKE ?";
        params.push(`%${buscar}%`);
    }

    const [rows] = await db.execute(query, params);

    res.json({ success: true, data: rows });
});

// Obtener un usuario por ID
router.get(
    "/:id",
    [param("id").isInt().withMessage("El ID debe ser un número entero")],
    verificarAutenticacion,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const [rows] = await db.execute(
            "SELECT id, nombre, email FROM usuarios WHERE id = ?",
            [id]
        );

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Usuario no encontrado" });
        }
        res.json({ success: true, data: rows[0] });
    }
);

// Crear nuevo usuario
router.post(
    "/",
    [
        body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
        body("email").isEmail().withMessage("Debe ser un email válido"),
        body("password")
            .isLength({ min: 6 })
            .withMessage("La contraseña debe tener al menos 6 caracteres"),
    ],
    verificarValidaciones,
    async (req, res) => {
        const { nombre, email, password } = req.body;

        // Hashear la contraseña antes de guardarla
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const [result] = await db.execute(
            "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)",
            [nombre, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            data: { id: result.insertId, nombre, email },
        });
    }
);

// Actualizar usuario
router.put(
    "/:id",
    [
        param("id").isInt().withMessage("El ID debe ser un número entero"),
        body("nombre").notEmpty().withMessage("El nombre es obligatorio"),
        body("email").isEmail().withMessage("Debe ser un email válido"),
    ],
    verificarAutenticacion,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const { nombre, email } = req.body;

        await db.execute(
            "UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?",
            [nombre, email, id]
        );

        res.status(200).json({ success: true, data: { id, nombre, email } });
    }
);

// Eliminar usuario
router.delete(
    "/:id",
    [param("id").isInt().withMessage("El ID debe ser un número entero")],
    verificarAutenticacion,
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        await db.execute("DELETE FROM usuarios WHERE id = ?", [id]);
        res.status(200).json({ success: true, data: { id } });
    }
);

export default router;
