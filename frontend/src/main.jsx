import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@picocss/pico";
import "./index.css";
import { Layout } from "./componentes/Layout.jsx";
import { Notas } from "./paginas/Notas.jsx";
import { AuthPage, AuthProvider } from "./contexto/Auth.jsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Usuarios } from "./paginas/Usuarios.jsx";
import { DetallesUsuario } from "./paginas/DetallesUsuario.jsx";
import { CrearUsuario } from "./paginas/CrearUsuario.jsx";
import { ModificarUsuario } from "./paginas/ModificarUsuario.jsx";
import { Alumnos } from "./paginas/Alumnos.jsx";
import { CrearAlumno } from "./paginas/CrearAlumno.jsx";
import { ModificarAlumno } from "./paginas/ModificarAlumno.jsx";
import { Materias } from "./paginas/Materias.jsx";
import { CrearMateria } from "./paginas/CrearMateria.jsx";
import { ModificarMateria } from "./paginas/ModificarMateria.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <AuthPage>
                  <Notas />
                </AuthPage>
              }
            />
            <Route
              path="usuarios"
              element={
                <AuthPage>
                  <Usuarios />
                </AuthPage>
              }
            />
            <Route
              path="usuarios/:id"
              element={
                <AuthPage>
                  <DetallesUsuario />
                </AuthPage>
              }
            />
            <Route
              path="usuarios/:id/modificar"
              element={
                <AuthPage>
                  <ModificarUsuario />
                </AuthPage>
              }
            />
            <Route
              path="usuarios/crear"
              element={<CrearUsuario />}
            />
            <Route
              path="alumnos"
              element={
                <AuthPage>
                  <Alumnos />
                </AuthPage>
              }
            />
            <Route
              path="alumnos/crear"
              element={
                <AuthPage>
                  <CrearAlumno />
                </AuthPage>
              }
            />
            <Route
              path="alumnos/:id/modificar"
              element={
                <AuthPage>
                  <ModificarAlumno />
                </AuthPage>
              }
            />
            <Route
              path="materias"
              element={
                <AuthPage>
                  <Materias />
                </AuthPage>
              }
            />
            <Route
              path="materias/crear"
              element={
                <AuthPage>
                  <CrearMateria />
                </AuthPage>
              }
            />
            <Route
              path="materias/:id/modificar"
              element={
                <AuthPage>
                  <ModificarMateria />
                </AuthPage>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
);
