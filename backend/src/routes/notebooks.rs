use axum::{
    extract::{State, Path},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use uuid::Uuid;

use crate::{models::*, AppState};

// GET /api/notebooks - List all notebooks with note count
pub async fn list_notebooks(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, StatusCode> {
    // TODO: Add user authentication - for now using hardcoded user
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();

    let notebooks = sqlx::query_as::<_, NotebookWithCount>(
        r#"
        SELECT
            nb.id,
            nb.user_id,
            nb.name,
            nb.color,
            nb.created_at,
            nb.updated_at,
            COALESCE(COUNT(n.id), 0) as note_count
        FROM notebooks nb
        LEFT JOIN notes n ON nb.id = n.notebook_id
        WHERE nb.user_id = $1
        GROUP BY nb.id, nb.user_id, nb.name, nb.color, nb.created_at, nb.updated_at
        ORDER BY nb.created_at DESC
        "#
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

// POST /api/notebooks - Create new notebook
pub async fn create_notebook(
    State(state): State<AppState>,
    Json(payload): Json<CreateNotebookRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();
    let color = payload.color.unwrap_or_else(|| "#6366f1".to_string());

    let notebook = sqlx::query_as::<_, Notebook>(
        r#"
        INSERT INTO notebooks (user_id, name, color)
        VALUES ($1, $2, $3)
        RETURNING *
        "#
    )
    .bind(user_id)
    .bind(&payload.name)
    .bind(&color)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok((StatusCode::CREATED, Json(notebook)))
}

// PUT /api/notebooks/:id - Update notebook
pub async fn update_notebook(
    State(state): State<AppState>,
    Path(notebook_id): Path<Uuid>,
    Json(payload): Json<UpdateNotebookRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();

    // First, check if notebook exists and belongs to user
    let existing_notebook = sqlx::query_as::<_, Notebook>(
        "SELECT * FROM notebooks WHERE id = $1 AND user_id = $2"
    )
    .bind(notebook_id)
    .bind(user_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let existing_notebook = existing_notebook.ok_or(StatusCode::NOT_FOUND)?;

    // Update only provided fields
    let name = payload.name.unwrap_or(existing_notebook.name);
    let color = payload.color.unwrap_or(existing_notebook.color);

    let updated_notebook = sqlx::query_as::<_, Notebook>(
        r#"
        UPDATE notebooks
        SET name = $1, color = $2, updated_at = NOW()
        WHERE id = $3 AND user_id = $4
        RETURNING *
        "#
    )
    .bind(&name)
    .bind(&color)
    .bind(notebook_id)
    .bind(user_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(updated_notebook))
}

// DELETE /api/notebooks/:id - Delete notebook
pub async fn delete_notebook(
    State(state): State<AppState>,
    Path(notebook_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();

    let result = sqlx::query!(
        r#"
        DELETE FROM notebooks
        WHERE id = $1 AND user_id = $2
        "#,
        notebook_id,
        user_id
    )
    .execute(&state.db)
    .await;

    match result {
        Ok(result) => {
            if result.rows_affected() == 0 {
                Err(StatusCode::NOT_FOUND)
            } else {
                Ok(StatusCode::NO_CONTENT)
            }
        }
        Err(e) => {
            tracing::error!("Database error: {}", e);
            Err(StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

// PUT /api/notes/:id/notebook - Assign note to notebook
pub async fn assign_note_to_notebook(
    State(state): State<AppState>,
    Path(note_id): Path<Uuid>,
    Json(notebook_id): Json<Option<Uuid>>,
) -> Result<StatusCode, StatusCode> {
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();

    // Verify note belongs to user
    let note_exists = sqlx::query!(
        "SELECT id FROM notes WHERE id = $1 AND user_id = $2",
        note_id,
        user_id
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?
    .is_some();

    if !note_exists {
        return Err(StatusCode::NOT_FOUND);
    }

    // If notebook_id is provided, verify it belongs to user
    if let Some(nb_id) = notebook_id {
        let notebook_exists = sqlx::query!(
            "SELECT id FROM notebooks WHERE id = $1 AND user_id = $2",
            nb_id,
            user_id
        )
        .fetch_optional(&state.db)
        .await
        .map_err(|e| {
            tracing::error!("Database error: {}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?
        .is_some();

        if !notebook_exists {
            return Err(StatusCode::NOT_FOUND);
        }
    }

    // Update note's notebook_id
    sqlx::query!(
        r#"
        UPDATE notes
        SET notebook_id = $1, updated_at = NOW()
        WHERE id = $2 AND user_id = $3
        "#,
        notebook_id,
        note_id,
        user_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(StatusCode::OK)
}
