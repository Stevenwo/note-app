use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use uuid::Uuid;

use crate::{models::Notebook, AppState};

pub async fn list_notebooks(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = Uuid::nil(); // Placeholder

    let notebooks = sqlx::query_as::<_, Notebook>(
        "SELECT * FROM notebooks WHERE user_id = $1 ORDER BY created_at DESC"
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(notebooks))
}
