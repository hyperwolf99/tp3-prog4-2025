import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { verificarAutenticacion } from "./auth.js";
import { body, param } from "express-validator";

const router = express.Router();

// Obtener todas las notas
router.get("/", async (req, res) => {
    const [rows] = await db.execute(`
    SELECT 
      n.id, n.nota1, n.nota2, n.nota3,
      TRUNCATE((n.nota1 + n.nota2 + n.nota3) / 3, 2) AS promedio,
      a.id as alumno_id, a.nombre as alumno_nombre, a.apellido as alumno_apellido,
      m.id as materia_id, m.nombre as materia_nombre
    FROM notas n
    JOIN alumnos a ON n.alumno_id = a.id
    JOIN materias m ON n.materia_id = m.id
  `);

    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "No hay notas" });
    }
    res.json({ success: true, data: rows });
});

// Crear nueva nota
router.post(
    "/",
    [
        body("alumno_id").isInt().withMessage("El ID del alumno debe ser un número entero"),
        body("materia_id").isInt().withMessage("El ID de la materia debe ser un número entero"),
        body("nota1").isFloat({ min: 0, max: 10 }).withMessage("La nota1 debe ser un número entre 0 y 10"),
        body("nota2").isFloat({ min: 0, max: 10 }).withMessage("La nota2 debe ser un número entre 0 y 10"),
        body("nota3").isFloat({ min: 0, max: 10 }).withMessage("La nota3 debe ser un número entre 0 y 10"),
    ],
    verificarAutenticacion, verificarValidaciones, async (req, res) => {
        const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

        const [result] = await db.execute(
            "INSERT INTO notas (alumno_id, materia_id, nota1, nota2, nota3) VALUES (?, ?, ?, ?, ?)",
            [alumno_id, materia_id, nota1, nota2, nota3]
        );

        res.status(201).json({
            success: true,
            data: {
                id: result.insertId,
                alumno_id,
                materia_id,
                nota1,
                nota2,
                nota3
            },
        });
    }
);

// Notas por alumno (Incluye datos de materia y promedio)
router.get(
    "/alumno/:alumno_id",
    [param("alumno_id").isInt().withMessage("El ID del alumno debe ser un número entero")],
    verificarAutenticacion, verificarValidaciones, async (req, res) => {
        const alumno_id = Number(req.params.alumno_id);

        const [rows] = await db.execute(`
        SELECT 
          n.id, n.nota1, n.nota2, n.nota3,
          TRUNCATE((n.nota1 + n.nota2 + n.nota3) / 3, 2) AS promedio,
          m.id as materia_id, m.nombre as materia_nombre
        FROM notas n
        JOIN materias m ON n.materia_id = m.id
        WHERE n.alumno_id = ?
      `, [alumno_id]);

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "No hay notas para este alumno" });
        }

        res.status(200).json({ success: true, data: rows });
    }
);

// Notas por materia (Incluye datos de alumno y promedio)
router.get(
    "/materia/:materia_id",
    [param("materia_id").isInt().withMessage("El ID de la materia debe ser un número entero")],
    verificarAutenticacion, verificarValidaciones, async (req, res) => {
        const materia_id = Number(req.params.materia_id);

        const [rows] = await db.execute(`
        SELECT 
          n.id, n.nota1, n.nota2, n.nota3,
          TRUNCATE((n.nota1 + n.nota2 + n.nota3) / 3, 2) AS promedio,
          a.id as alumno_id, a.nombre as alumno_nombre, a.apellido as alumno_apellido
        FROM notas n
        JOIN alumnos a ON n.alumno_id = a.id
        WHERE n.materia_id = ?
      `, [materia_id]);

        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "No hay notas para esta materia" });
        }

        res.status(200).json({ success: true, data: rows });
    }
);

// Actualizar nota
router.put(
    "/:id",
    [
        body("alumno_id").isInt().withMessage("El ID del alumno debe ser un número entero"),
        body("materia_id").isInt().withMessage("El ID de la materia debe ser un número entero"),
        body("nota1").isFloat({ min: 0, max: 10 }).withMessage("La nota1 debe ser un número entre 0 y 10"),
        body("nota2").isFloat({ min: 0, max: 10 }).withMessage("La nota2 debe ser un número entre 0 y 10"),
        body("nota3").isFloat({ min: 0, max: 10 }).withMessage("La nota3 debe ser un número entre 0 y 10"),
    ],
    verificarAutenticacion, verificarValidaciones, async (req, res) => {
        const id = Number(req.params.id);
        const { alumno_id, materia_id, nota1, nota2, nota3 } = req.body;

        const [rows] = await db.execute("SELECT * FROM notas WHERE id = ?", [id]);
        if (rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "Nota no encontrada" });
        }
        await db.execute(
            "UPDATE notas SET alumno_id = ?, materia_id = ?, nota1 = ?, nota2 = ?, nota3 = ? WHERE id = ?",
            [alumno_id, materia_id, nota1, nota2, nota3, id]
        );

        res.status(200).json({
            success: true,
            data: { id, alumno_id, materia_id, nota1, nota2, nota3 },
        });
    }
);

export default router;
