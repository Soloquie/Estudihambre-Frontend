# Brechas entre el frontend y el backend

## Ya cubierto

- Sección estudiantil (RF-11): descuentos y tiqueteras con vigencia, código y condiciones.
- Horario de atención (RF-21): apertura, cierre, cierre temporal y estado abierto/cerrado calculado por el backend.

## Pendiente

Lo que el plan de trabajo o el Entregable 2 contemplan y el backend todavía no expone. El frontend no lo simula con datos inventados.

| Requerimiento | Estado en el backend | Qué hace hoy el frontend |
|---|---|---|
| Listado global de beneficios para la sección estudiantil | Solo existe `GET /api/establecimientos/{id}/beneficios-estudiantiles` | `/estudiantil` pide los beneficios de cada establecimiento aprobado (aceptable para el piloto) |
| Filtros "Abierto ahora" y "Con beneficio" | `GET /api/establecimientos` no los recibe | Se filtran en el navegador con `abiertoAhora` y los beneficios ya cargados |
| Quitar el horario o las fechas de un beneficio ya guardado | En el PUT, `null` significa "no cambiar" | El formulario lo avisa; se puede activar "Cerrado temporalmente" o pausar el beneficio |
| Horario distinto por día de la semana | Un solo `horaApertura`/`horaCierre` | Se muestra "Todos los días, …" |
| Tamaño de porción y filtro por cantidad (RF-10) | Sin campo de porción; la calificación es una sola puntuación | No se muestra; se ordena por calificación general |
| Reportar dato incorrecto (RF-17) y reportar comentario (RF-16) | No hay endpoints de reportes | El administrador oculta comentarios directamente (RF-20) |
| Calidad y cantidad como calificaciones separadas | `CalificacionCrearDTO` solo tiene `puntuacion` | Una sola calificación de 1 a 5 |
| Aceptación de la política de datos (Ley 1581) en el registro | `UsuarioRegistroDTO` no la recibe | Casilla obligatoria en el formulario; no se guarda |
| Resumen de calificaciones en el listado | Solo existe por establecimiento | Se pide un resumen por cada establecimiento (aceptable para 5 a 10 lugares del piloto) |
| Fecha de actualización del menú (RF-19) | `MenuRespuestaDTO` no incluye fecha | No se muestra |
| "Mis calificaciones" del usuario | `findByUsuarioId` existe en el repositorio, pero sin endpoint | No se muestra en el perfil |

## Configuración del backend para producción

- `logging.level.org.springframework.security=TRACE` y `spring.jpa.show-sql=true` en `application.properties` llenan la consola; para la entrega conviene `INFO` y `false`.
- `ImagenController` está vacío.
