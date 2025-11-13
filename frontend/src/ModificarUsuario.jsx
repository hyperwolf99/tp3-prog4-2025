import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./Auth";
import { useNavigate, useParams } from "react-router-dom";

export const ModificarUsuario = () => {
  const { fetchAuth } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  const [values, setValues] = useState(null);
  const [error, setError] = useState(null);

  const fetchUsuario = useCallback(async () => {
    const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      console.log("Error al consultar por usuario:", data.error);
      return;
    }
    setValues(data.data); // Los datos están en data.data
  }, [fetchAuth, id]);

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const response = await fetchAuth(`http://localhost:3000/usuarios/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email,
        nombre: values.nombre,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      setError(data.message || "Error al modificar el usuario.");
      return;
    }

    navigate("/usuarios");
  };

  if (!values) {
    // Mostrar un estado de carga mientras se obtienen los datos
    return <article aria-busy="true">Cargando datos del usuario...</article>;
  }

  return (
    <article>
      <h2>Modificar usuario</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <label>
            Email
            <input
              required
              type="email"
              value={values.email || ""}
              onChange={(e) =>
                setValues({ ...values, email: e.target.value })
              }
            />
          </label>
          <label>
            Nombre
            <input
              required
              value={values.nombre || ""}
              onChange={(e) => setValues({ ...values, nombre: e.target.value })}
            />
          </label>
        </fieldset>
        {error && (
          <p>
            <mark>{error}</mark>
          </p>
        )}
        <input type="submit" value="Modificar usuario" />
      </form>
    </article>
  );
};
