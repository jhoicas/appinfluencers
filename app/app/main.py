"""
Main FastAPI application entry point.
"""
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging

from app.core.config import settings
from app.api import auth, users, profiles, campaigns, notifications, subscription_plans, transactions

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Backend API for Influencers Platform MVP",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add custom validation error handler
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"❌ Validation error on {request.method} {request.url}")
    # Evitar leer el body para no provocar ClientDisconnect
    logger.error(f"Errors: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors()},
    )

# Configure CORS
# Configuración para desarrollo y producción
# El frontend usa /api/* que Next.js redirige internamente al backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",      # Frontend en desarrollo
        "http://localhost:8000",      # Backend directo (Swagger docs)
        "http://frontend:3000",       # Frontend en Docker
        "https://influencers-frontend.onrender.com",
        "https://influencers-api.onrender.com",
        "https://influencers-api-bj5q.onrender.com",
        "https://*.ondigitalocean.app",  # Digital Ocean App Platform
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profiles.router)
app.include_router(campaigns.router)
app.include_router(notifications.router)
app.include_router(subscription_plans.router)
app.include_router(transactions.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Influencers Platform API",
        "version": settings.VERSION,
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring."""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT
    }


@app.on_event("startup")
async def startup_event():
    """
    Startup event handler.
    Initialize database connections and other resources.
    """
    print(f"Starting {settings.APP_NAME} v{settings.VERSION}")
    print(f"Environment: {settings.ENVIRONMENT}")
    print(f"Debug mode: {settings.DEBUG}")
    print(f"CORS: Configured for specific origins (credentials enabled)")
    print(f"Database URL: {settings.DATABASE_URL[:20]}...")
    
    # Auto-seed database if empty
    try:
        print("🔄 Iniciando proceso de auto-seed...")
        from app.core.database import AsyncSessionLocal, engine, Base
        from app.core.seed import seed_initial_data
        
        # Crear tablas si no existen
        print("📋 Creando tablas...")
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        print("✅ Tablas verificadas/creadas")
        
        # Seed data si la BD está vacía
        print("🌱 Verificando datos iniciales...")
        async with AsyncSessionLocal() as db:
            await seed_initial_data(db)
    except Exception as e:
        print(f"⚠️  Error durante auto-seed: {e}")
        import traceback
        traceback.print_exc()
        # No interrumpir el inicio de la app


@app.on_event("shutdown")
async def shutdown_event():
    """
    Shutdown event handler.
    Clean up resources.
    """
    print("Shutting down...")
