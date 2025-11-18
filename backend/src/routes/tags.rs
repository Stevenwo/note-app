use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use uuid::Uuid;

use crate::{models::Tag, AppState};

pub async fn list_tags(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = Uuid::nil(); // Placeholder

    let tags = sqlx::query_as::<_, Tag>(
        "SELECT * FROM tags WHERE user_id = $1 ORDER BY name ASC"
    )
    .bind(user_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(tags))
}
