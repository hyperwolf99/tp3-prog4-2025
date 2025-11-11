import express from "express";
import { db } from "./db.js";
import {
    validarId,
    verificarValidaciones,
    validarUsuario
} from "./validaciones.js";
import bcrypt from "bcrypt";
import { verificarAutenticacion } from "./auth.js";

const router = express.Router();

router.get("/", verificarAutenticacion, async (req, res) => {
    const [rows] = await db.execute("SELECT id, nombre, email FROM usuarios");

    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "No hay usuarios" });
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

router.post(
    "/",
    //verificarAutenticacion,
    validarUsuario(),
    verificarValidaciones,
    async (req, res) => {
        const { nombre, email, password } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await db.execute(
            "INSERT INTO usuarios (nombre, email, password_hash) VALUES (?, ?, ?)",
            [nombre, email, hashedPassword]
        );

        res.json({
            success: true,
            data: {
                id: result.insertId,
                nombre,
                email
            },
        });
    }
);

router.put(
    "/:id",
    verificarAutenticacion,
    validarId(),
    validarUsuario(),
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);
        const { nombre, email, password } = req.body;

        const [rows] = await db.execute("SELECT * FROM usuarios WHERE id = ?", [
            id,
        ]);
        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Usuario no encontrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.execute(
            "UPDATE usuarios SET nombre = ?, email = ?, password_hash = ? WHERE id = ?",
            [nombre, email, hashedPassword, id]
        );

        res.json({
            success: true,
            data: { id, nombre, email },
        });
    }
);

router.delete(
    "/:id",
    verificarAutenticacion,
    validarId(),
    verificarValidaciones,
    async (req, res) => {
        const id = Number(req.params.id);

        const [rows] = await db.execute("SELECT * FROM usuarios WHERE id = ?", [
            id,
        ]);
        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Usuario no encontrado" });
        }

        await db.execute("DELETE FROM usuarios WHERE id = ?", [id]);

        res.json({ success: true, message: "Usuario eliminado" });
    }
);

export default router;
