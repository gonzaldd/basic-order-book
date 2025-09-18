# Sistema de Order Book - Intercambio de Divisas

## 📋 Descripción

Sistema de microservicios para el manejo de órdenes de intercambio de divisas construido con NestJS, PostgreSQL y RabbitMQ. El sistema permite crear, procesar y gestionar órdenes de cambio de monedas con validación de liquidez en tiempo real.

## 🏗️ Arquitectura del Sistema
![diagrama](https://raw.githubusercontent.com/gonzaldd/basic-order-book/refs/heads/main/doc/diagram.jpg)

### Diagrama de Arquitectura


### Componentes del Sistema

#### 1. API Gateway (Puerto 3000)
- **Responsabilidades**:
  - Autenticación y autorización basada en JWT
  - Enrutamiento de peticiones a microservicios
  - Documentación de API (Swagger)
  - Validación de entrada
- **Endpoints Principales**:
  - `POST /auth/login` - Autenticación de usuario
  - `POST /order` - Crear nueva orden (protegido)
  - `POST /order/process-order` - Procesar orden (protegido)

#### 2. Order Service
- **Responsabilidades**:
  - Lógica de negocio de órdenes
  - Operaciones de base de datos
  - Manejo de mensajes via RabbitMQ
- **Características Principales**:
  - Creación de órdenes con validación
  - Gestión de estados (PENDIENTE, PROCESADA, FALLIDA)
  - Validación de intercambio de divisas
  - Sistema de reintentos con límite máximo

#### 3. Broker de Mensajes (RabbitMQ)
- **Puertos**: 5672 (AMQP), 15672 (Interfaz de Gestión)
- **Colas**:
  - `orders` - Solicitudes de creación de órdenes
  - Patrones de eventos para procesamiento de órdenes
- **Características**:
  - Colas duraderas con configuración de quórum
  - Gestión de conexiones con amqp-connection-manager

#### 4. Base de Datos (PostgreSQL)
- **Puerto**: 5432
- **Esquema**:
  - Tabla `orders` con campos: id, monto, moneda_origen, moneda_destino, estado
  - Tabla `liquidity` con campos: id, base_currency, quote_currency, rate, available_base_amount
- **Gestión**: Interfaz PgAdmin en puerto 5050

## 🚀 Cómo Ejecutar el Proyecto

### Prerrequisitos

- Docker y Docker Compose

### Configuración Inicial

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/gonzaldd/basic-order-book.git
   cd basic-order-book
   ```

2. **Crear archivo de variables de entorno**:
   ```bash
   cp .env.example .env
   ```

### Ejecución con Docker Compose

1. **Levantar todos los servicios**:
   ```bash
   docker-compose up -d
   ```

2. **Verificar que todos los servicios estén ejecutándose**:
   ```bash
   docker-compose ps
   ```

3. **Ver logs de los servicios**:
   ```bash
   # Ver todos los logs
   docker-compose logs -f
   
   # Ver logs de un servicio específico
   docker-compose logs -f api-gateway
   docker-compose logs -f order-service
   ```

### Acceso a los Servicios

- **API Gateway**: http://localhost:3000
- **Documentación Swagger**: http://localhost:3000/api
- **PgAdmin**: http://localhost:5050
- **RabbitMQ Management**: http://localhost:15672

## 📚 Uso de la API
### Ejemplo de Flujo Completo

1. **Autenticarse**:
   ```bash
   TOKEN=$(curl -s -X POST http://localhost:3000/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "admin123"}' | \
     jq -r '.access_token')
   ```

2. **Crear una orden**:
   ```bash
   curl -X POST http://localhost:3000/order \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{
       "monto": 1000,
       "moneda_origen": "USD",
       "moneda_destino": "EUR"
     }'
   ```

3. **Procesar la orden**:
   ```bash
   curl -X POST http://localhost:3000/order/process-order \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"orderId": "uuid-de-la-orden"}'
   ```

## 🏛️ Decisiones de Arquitectura

### ¿Por qué Microservicios?

**Ventajas elegidas**:
- **Escalabilidad independiente**: Cada servicio puede escalarse según su demanda
- **Tecnologías especializadas**: Diferentes servicios pueden usar las mejores herramientas para su dominio
- **Falla aislada**: Un fallo en un servicio no afecta a todo el sistema
- **Desarrollo independiente**: Equipos pueden trabajar en paralelo sin conflictos

### ¿Por qué PostgreSQL?

**Razones de la elección**:
- **ACID completo**: Garantiza consistencia transaccional para operaciones financieras
- **Tipos de datos avanzados**: Soporte nativo para JSON, arrays, y tipos personalizados
- **Rendimiento**: Excelente para operaciones de lectura y escritura complejas
- **Ecosistema maduro**: Herramientas de migración, monitoreo y backup robustas
- **Escalabilidad**: Soporte para particionado, replicación y clustering

### ¿Por qué RabbitMQ?

**Ventajas del broker de mensajes**:
- **Desacoplamiento**: Los servicios no necesitan conocer la ubicación de otros servicios
- **Tolerancia a fallos**: Los mensajes persisten si un servicio está temporalmente fuera de línea
- **Patrones de mensajería**: Soporte para pub/sub, colas, y routing complejo
- **Garantías de entrega**: Configuración de acuse de recibo y reintentos

### ¿Por qué NestJS?

**Beneficios del framework**:
- **Arquitectura modular**: Fácil organización de código en módulos
- **Decoradores**: Sintaxis limpia para validación, autenticación y documentación
- **TypeScript nativo**: Mejor experiencia de desarrollo y menos errores
- **Ecosistema**: Integración fácil con bases de datos, brokers de mensajes y herramientas de monitoreo
- **Testing**: Herramientas integradas para testing unitario y de integración

## 🚀 Escalabilidad: 10,000 Transacciones por Segundo

### Limitaciones Actuales



1. **Base de datos única**: PostgreSQL como cuello de botella
2. **Sin cache**: Todas las consultas van a la base de datos
3. **Procesamiento secuencial**: Las órdenes se procesan una por una

### Cambios Necesarios para 10,000 TPS

#### 1. Arquitectura de Base de Datos

- **Implementar Sharding**

- **Read Replicas**:
  - 1 Master para escrituras
  - 3-5 Read Replicas para consultas
  - Balanceador de carga para distribuir lecturas

- **Particionado de Tablas**:


#### 2. Cache Distribuido para Procesar orden

- Ejemplo: **Redis Cluster**:

#### 3. Aumentar las instancias de los microservicios

#### 4. Colas de Procesamiento:
- **Cola de Alta Prioridad**: Órdenes urgentes
- **Cola de Procesamiento Normal**: Órdenes estándar
- **Cola de Reintentos**: Órdenes fallidas


## 🔧 Desarrollo

### Estructura del Proyecto

```
order-book/
├── api-gateway/           # Servicio de API Gateway
│   ├── src/
│   │   ├── auth/         # Módulo de autenticación
│   │   ├── order/        # Módulo de órdenes
│   │   └── main.ts       # Punto de entrada
│   └── package.json
├── order-service/         # Servicio de órdenes
│   ├── src/
│   │   ├── order/        # Lógica de órdenes
│   │   ├── liquidity/    # Gestión de liquidez
│   │   └── main.ts       # Punto de entrada
│   └── package.json
├── docker-compose.yml     # Orquestación de servicios
└── README.md             # Este archivo
```

### Convenciones de Código

- **TypeScript**: Tipado estricto habilitado
- **ESLint**: Configuración estándar de NestJS
- **Prettier**: Formateo automático de código