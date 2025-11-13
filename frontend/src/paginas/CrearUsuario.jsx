import { useState } from "react";
import { useAuth } from "../contexto/Auth";
import { useNavigate } from "react-router-dom";

export const CrearUsuario = () => {
  const { fetchAuth } = useAuth(); // Usar fetchAuth para rutas protegidas
  const navigate = useNavigate();
  const [errores, setErrores] = useState(null);

  const [values, setValues] = useState({
    email: "", 
    nombre: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrores(null);

    // fetchAuth si la ruta está protegida. Si es pública fetch normal.
    const response = await fetch("http://localhost:3000/usuarios", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nombre: values.nombre,
        email: values.email,
        password: values.password,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      if (response.status === 400) {
        // El backend puede devolver 'errors' o 'errores'
        return setErrores(data.errors || data.errores);
      }
      return window.alert("Error al crear usuario");
    }
    navigate("/usuarios"); // redirigir al login si el usuario debe ingresar después de registrarse
  };

  return (
    <article>
      <h2>Crear usuario</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Email
            <input
              required type="email"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
              aria-invalid={
                errores && errores.some((e) => e.path === "email")
              }
            />
            {errores && (
              <small>
                {errores
                  .filter((e) => e.path === "email")
                  .map((e) => e.msg)
                  .join(", ")}
              </small>
            )}
          </label>
          <label>
            Nombre
            <input
              required
              value={values.nombre}
              onChange={(e) => setValues({ ...values, nombre: e.target.value })}
              aria-invalid={errores && errores.some((e) => e.path === "nombre")}
            />
            {errores && (
              <small>
                {errores
                  .filter((e) => e.path === "nombre")
                  .map((e) => e.msg)
                  .join(", ")}
              </small>
            )}
          </label>
          <label>
            Contraseña
            <input
              required
              type="password"
              value={values.password}
              onChange={(e) => setValues({ ...values, password: e.target.value })}
              aria-invalid={
                errores && errores.some((e) => e.path === "password")
              }
            />
            {errores && (
              <small>
                {errores
                  .filter((e) => e.path === "password")
                  .map((e) => e.msg)
                  .join(", ")}
              </small>
            )}
          </label>
        </fieldset>
        <input type="submit" value="Crear usuario" />
      </form>
    </article>
  );
};
