# Road map: Delivery Analytics Dashboard

Aplicación web (SPA) para repartidores de delivery que calcula métricas diarias, semanales y mensuales, y permite cargar la hoja del día con una foto leída por IA.

## Objetivo de la versión 1.0

La 1.0 está lista cuando se cumple todo esto:

- [ ] Inicio sesión con mi usuario
- [ ] Subo la foto de mi hoja del día
- [ ] Reviso y corrijo lo que leyó la IA
- [ ] Los pedidos se guardan y los veo desde el celular y desde el computador
- [ ] Las vistas Día, Semana y Mes muestran totales y promedios correctos
- [ ] Puedo agregar, editar y borrar pedidos manualmente
- [ ] Funciona el modo claro / oscuro
- [ ] Se ve bien en celular

## Principio del plan

Primero todo funciona en el navegador guardando en `localStorage`. Después se mueve el guardado a un servidor. Así cada fase se puede probar por separado y no se mezclan demasiados conceptos nuevos a la vez.

**Hábito:** un commit por cada paso, con un mensaje claro (por ejemplo, `agrega modo oscuro`).

---

## Ya hecho

- [x] **Fase 1:** maquetado HTML/CSS completo, responsive, con modo oscuro definido en CSS
- [x] **Navegación:** cambio entre Día / Semana / Mes con JavaScript
- [x] **Repositorio en GitHub y despliegue en Vercel** (para probar en el celular)

---

## Fase 2: el dashboard vivo (solo frontend)

- [ ] 1. **Modo claro / oscuro:** botón en el header que alterna `data-theme="dark"`
- [ ] 2. **Los datos como datos:** un arreglo de objetos (un pedido = un objeto con hora, aporte cliente, aporte restaurante, repartidor) y JS que dibuja la tabla a partir de él
- [ ] 3. **Calcular métricas:** totales y promedios del día salen de los datos, no de números fijos
- [ ] 4. **Agregar pedido manual:** formulario en un modal; el pedido entra al arreglo y todo se recalcula
- [ ] 5. **Editar y borrar:** botones por fila
- [ ] 6. **Guardar en `localStorage`:** que al recargar no se pierda nada
- [ ] 7. **Semana y Mes reales:** agrupar pedidos por semana y por mes, y que funcionen los botones anterior / siguiente / esta semana / buscar

**Aprenderás:** arreglos, objetos, funciones con datos, crear elementos del DOM, formularios, fechas en JS, `localStorage`.

## Fase 3: login (pantalla)

- [ ] 8. Pantalla de login y botón de cerrar sesión, por ahora **simulados** (sin servidor), para dejar lista la interfaz y el flujo

## Fase 4: el servidor

- [ ] 9. **Backend básico** (Node.js + Express): un servidor que responde a peticiones
- [ ] 10. **Base de datos** para usuarios y pedidos
- [ ] 11. **API de pedidos:** crear, leer, editar y borrar, desde el navegador con `fetch`
- [ ] 12. **Login real:** registro, contraseñas protegidas (nunca en texto plano) y sesión
- [ ] 13. **Reemplazar `localStorage` por el servidor** en el frontend (aquí se gana el multidispositivo)
- [ ] 14. **Publicar el servidor** (evaluar si conviene hacerlo en Vercel, que ya está configurado)

**Aprenderás:** cliente-servidor, `async/await`, `fetch`, rutas, bases de datos, autenticación, variables de entorno.

## Fase 5: la foto con IA

- [ ] 15. Botón y modal para **elegir la foto** con vista previa (`<input type="file">`)
- [ ] 16. **Enviarla al servidor**, que llama a la API de IA para leerla
- [ ] 17. La IA devuelve **JSON** con los pedidos
- [ ] 18. **Pantalla de revisión:** antes de guardar, el usuario ve y corrige lo que leyó la IA
- [ ] 19. **Sobrescritura inteligente:** si ese día ya tiene pedidos, preguntar qué hacer

**Notas importantes:**

- La llamada a la IA **tiene que pasar por el servidor**: la clave de la API nunca debe estar en el navegador.
- La clave **nunca se sube a GitHub**: se guarda en variables de entorno.
- Usar una API de IA tiene costo por uso y suele requerir método de pago. Revisarlo antes de llegar a esta fase.

## Fase 6: cierre de la 1.0

- [ ] 20. Pruebas en celular y manejo de errores (sin internet, foto borrosa, etc.)
- [ ] 21. `README.md` completo en el repositorio
- [ ] 22. Prueba con uso real y publicación de la versión 1.0

---

## Estructura de archivos actual

```
index.html
styles.css
script.js
```
