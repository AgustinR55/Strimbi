# Reglas de Negocio - EcoTrack

EcoTrack es una aplicación web para registrar acciones ecológicas diarias. Los usuarios ganan "EcoPuntos" por cada acción realizada y suben de nivel. El sistema consta de un backend con base de datos (PostgreSQL o MongoDB) y un frontend en React.

## 1. Reglas de Usuarios y Autenticación
- El registro requiere: Nombre, Email (único), Contraseña.
- La contraseña debe tener mínimo 8 caracteres, 1 mayúscula, 1 número y 1 símbolo.
- Cada usuario inicia con 0 EcoPuntos y nivel "Semilla".
- La autenticación se maneja con JWT (JSON Web Tokens). El token expira a las 24 horas.

## 2. Reglas de Registro de Acciones (Hábitos)
- Los usuarios pueden registrar acciones en las siguientes categorías: Transporte, Reciclaje, Energía, Agua.
- **Límite diario:** Un usuario no puede registrar más de 5 acciones por día.
- **Fechas:** No se pueden registrar acciones con fechas futuras ni con más de 7 días de antigüedad.
- **Puntuación base:**
  - Transporte (Bici/Caminar) = 10 pts
  - Reciclaje = 5 pts
  - Ahorro de Energía = 8 pts
  - Ahorro de Agua = 6 pts
- **Duplicados:** No se puede registrar la misma acción exacta dos veces en el mismo día (ej: no puedes poner "fui en bici al trabajo" dos veces el mismo día).

## 3. Reglas de Niveles y Recompensas
- **Semilla:** 0 a 99 pts.
- **Brote:** 100 a 499 pts.
- **Árbol:** 500 a 999 pts.
- **Bosque:** 1000+ pts.
- Al subir de nivel, el usuario recibe una notificación en el frontend (animación de celebración).
- Si un usuario no registra ninguna acción durante 7 días, pierde 10 EcoPuntos (regla de inactividad).

## 4. Reglas del Backend (API y Base de Datos)
- Todos los endpoints (excepto login y registro) deben requerir el token JWT en el header `Authorization: Bearer <token>`.
- La base de datos debe tener tres tablas/colecciones: `Users`, `Actions` (catálogo de acciones), `Logs` (registro de acciones de los usuarios).
- Validar estrictamente en el backend que no se manipule la puntuación desde el frontend; la puntuación se calcula y asigna en el servidor.
- Manejo de errores estandarizado: `{ error: true, message: "descripción del error" }`.

## 5. Reglas del Frontend
- El dashboard principal debe mostrar: EcoPuntos totales, Nivel actual, y una gráfica de barras con las acciones de la última semana.
- El botón de "Registrar Acción" debe estar deshabilitado si el usuario ya registró 5 acciones en el día actual.
- Los formularios deben validar los campos en el cliente antes de enviar la petición al backend.