# Brechas del backend

- Calificaciones y comentarios tienen entidades y servicios, pero no controladores REST publicados.
- La búsqueda pública no combina `nombre` y `tipo`; cuando llega nombre, tipo se ignora.
- El listado no entrega precio mínimo ni cantidad de menús, por lo que el cliente debe pedir los menús y calcularlos.
- El registro no recibe ni persiste la aceptación de la política de tratamiento de datos personales.
- Faltan horario, tamaño de porción, beneficios estudiantiles y fecha de actualización solicitados por entregables posteriores.
- `application.properties` mantiene `logging.level.org.springframework.security=TRACE` y `spring.jpa.show-sql=true`; no son apropiados para producción.
- `ImagenController` está vacío.
- Un usuario `ADMIN` no puede registrar establecimientos por regla del servicio.
- No existe endpoint de detalle de un menú accesible para gestionar menús de un establecimiento no aprobado; el formulario debe basarse en los datos propios disponibles.
