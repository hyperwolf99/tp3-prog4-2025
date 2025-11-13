import express from "express";
import { db } from "./db.js";
import { verificarValidaciones } from "./validaciones.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body } from "express-validator";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";

const router = express.Router();

export function authConfig() {
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    };

    passport.use(
        new JwtStrategy(jwtOptions, async (payload, done) => {
            try {
                // payload debe contener userId (según login)
                if (!payload || !payload.userId) {
                    return done(null, false);
                }
                // opcional: cargar usuario completo desde DB si lo necesitas
                return done(null, payload);
            } catch (err) {
                return done(err, false);
            }
        })
    );
}

export const verificarAutenticacion = passport.authenticate("jwt", { session: false });

router.post(
    "/login",
    body("email").isEmail(),
    body("password").notEmpty(),
    verificarValidaciones,
    async (req, res) => {
        const { email, password } = req.body;

        const [usuarios] = await db.execute("SELECT * FROM usuarios WHERE email = ?", [email]);
        if (usuarios.length === 0) {
            return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }

        const hashedPassword = usuarios[0]?.password_hash;
        const passwordComparada = await bcrypt.compare(password, hashedPassword);
        if (!passwordComparada) {
            return res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }

        const payload = { userId: usuarios[0].id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "4h" });

        res.json({ success: true, token, user: { id: usuarios[0].id, nombre: usuarios[0].nombre, email: usuarios[0].email } });
    }
);

export default router;