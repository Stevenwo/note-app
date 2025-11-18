use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{get, post, delete, put},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use sqlx::postgres::PgPoolOptions;
use std::sync::Arc;
use tower_http::cors::CorsLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod models;
mod routes;

#[derive(Clone)]
pub struct AppState {
    db: sqlx::PgPool,
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "note_app_backend=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Load environment variables
    dotenvy::dotenv().ok();

    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    
    let host = std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = std::env::var("PORT").unwrap_or_else(|_| "8080".to_string());

    // Create database connection pool
    tracing::info!("Connecting to database...");
    let pool = PgPoolOptions::new()
        .max_connections(5)
        .connect(&database_url)
        .await?;
    
    tracing::info!("Database connected successfully");

    let state = AppState { db: pool };

    // Build application routes
    let app = Router::new()
        .route("/api/health", get(health_check))
        .route("/api/notes", get(routes::notes::list_notes))
        .route("/api/notes", post(routes::notes::create_note))
        .route("/api/notes/:id", delete(routes::notes::delete_note))
        .route("/api/notes/:id/star", put(routes::notes::toggle_star_note))
        .route("/api/notes/search", get(routes::notes::search_notes))
        .route("/api/notes/:id/tags", get(routes::tags::get_note_tags))
        .route("/api/notes/:id/tags", post(routes::tags::add_tag_to_note))
        .route("/api/notes/:id/tags/:tag_id", delete(routes::tags::remove_tag_from_note))
        .route("/api/notebooks", get(routes::notebooks::list_notebooks))
        .route("/api/tags", get(routes::tags::list_tags))
        .route("/api/tags", post(routes::tags::create_tag))
        .route("/api/tags/:id", put(routes::tags::update_tag))
        .route("/api/tags/:id", delete(routes::tags::delete_tag))
        .layer(CorsLayer::permissive())
        .with_state(state);

    let addr = format!("{}:{}", host, port);

    tracing::info!("Starting server on {}", addr);
    let listener = tokio::net::TcpListener::bind(&addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}

async fn health_check() -> impl IntoResponse {
    (StatusCode::OK, Json(serde_json::json!({
        "status": "ok",
        "service": "note-app-backend"
    })))
}
