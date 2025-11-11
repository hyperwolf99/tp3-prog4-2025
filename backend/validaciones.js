import { param, validationResult, body } from "express-validator";

// Validaciones
const validarId = () =>
    param("id")
        .isInt({ min: 1 })
        .withMessage("El ID debe ser un número entero mayor a 0");

const validarUsuario = () =>
    body("nombre")
        .notEmpty()
        .withMessage("El nombre es obligatorio")
        .isString()
        .isLength({ min: 3 })
        .withMessage("El nombre debe tener al menos 3 caracteres")
    body("email")
        .notEmpty()
        .withMessage("El email es obligatorio")
        .isString()
        .isLength({ min: 3 })
        .withMessage("El email debe tener al menos 3 caracteres")
    body("password")
        .isStrongPassword({minLength: 8, minLowercase: 1, minUppercase: 0, minNumbers: 1, minSymbols: 0})
        .withMessage("La contraseña debe tener al menos 8 caracteres, una minúscula y un número")

const verificarValidaciones = (req, res, next) => {
    // Validar ID
    const validacion = validationResult(req);
    if (!validacion.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: "Falla de validación",
            errors: validacion.array(),
        });
    }
    next();
};

export { validarId, verificarValidaciones, validarUsuario };