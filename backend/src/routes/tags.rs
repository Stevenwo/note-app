use axum::{
    extract::{State, Path},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use uuid::Uuid;

use crate::{models::*, AppState};

// GET /api/tags - List all tags with usage count
pub async fn list_tags(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, StatusCode> {
    // TODO: Add user authentication - for now using hardcoded user
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();

    let tags = sqlx::query_as::<_, TagWithCount>(
        r#"
        SELECT
            t.id,
            t.user_id,
            t.name,
            t.color,
            t.created_at,
            t.updated_at,
            COALESCE(COUNT(nt.note_id), 0) as note_count
        FROM tags t
        LEFT JOIN note_tags nt ON t.id = nt.tag_id
        WHERE t.user_id = $1
        GROUP BY t.id, t.user_id, t.name, t.color, t.created_at, t.updated_at
        ORDER BY t.name ASC
        "#
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

// POST /api/tags - Create new tag
pub async fn create_tag(
    State(state): State<AppState>,
    Json(payload): Json<CreateTagRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();
    let color = payload.color.unwrap_or_else(|| "#8B5CF6".to_string());

    let tag = sqlx::query_as::<_, Tag>(
        r#"
        INSERT INTO tags (user_id, name, color)
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
        // Check if it's a unique constraint violation
        if e.to_string().contains("duplicate key") {
            StatusCode::CONFLICT
        } else {
            StatusCode::INTERNAL_SERVER_ERROR
        }
    })?;

    Ok((StatusCode::CREATED, Json(tag)))
}

// PUT /api/tags/:id - Update tag
pub async fn update_tag(
    State(state): State<AppState>,
    Path(tag_id): Path<Uuid>,
    Json(payload): Json<UpdateTagRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();

    // First, check if tag exists and belongs to user
    let existing_tag = sqlx::query_as::<_, Tag>(
        "SELECT * FROM tags WHERE id = $1 AND user_id = $2"
    )
    .bind(tag_id)
    .bind(user_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let existing_tag = existing_tag.ok_or(StatusCode::NOT_FOUND)?;

    // Update only provided fields
    let name = payload.name.unwrap_or(existing_tag.name);
    let color = payload.color.unwrap_or(existing_tag.color);

    let updated_tag = sqlx::query_as::<_, Tag>(
        r#"
        UPDATE tags
        SET name = $1, color = $2, updated_at = NOW()
        WHERE id = $3 AND user_id = $4
        RETURNING *
        "#
    )
    .bind(&name)
    .bind(&color)
    .bind(tag_id)
    .bind(user_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        if e.to_string().contains("duplicate key") {
            StatusCode::CONFLICT
        } else {
            StatusCode::INTERNAL_SERVER_ERROR
        }
    })?;

    Ok(Json(updated_tag))
}

// DELETE /api/tags/:id - Delete tag
pub async fn delete_tag(
    State(state): State<AppState>,
    Path(tag_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();

    let result = sqlx::query!(
        r#"
        DELETE FROM tags
        WHERE id = $1 AND user_id = $2
        "#,
        tag_id,
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

// POST /api/notes/:id/tags - Add tag to note
pub async fn add_tag_to_note(
    State(state): State<AppState>,
    Path(note_id): Path<Uuid>,
    Json(tag_id): Json<Uuid>,
) -> Result<StatusCode, StatusCode> {
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();

    // Verify note and tag belong to user
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

    let tag_exists = sqlx::query!(
        "SELECT id FROM tags WHERE id = $1 AND user_id = $2",
        tag_id,
        user_id
    )
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?
    .is_some();

    if !tag_exists {
        return Err(StatusCode::NOT_FOUND);
    }

    // Insert into note_tags
    sqlx::query!(
        r#"
        INSERT INTO note_tags (note_id, tag_id)
        VALUES ($1, $2)
        ON CONFLICT (note_id, tag_id) DO NOTHING
        "#,
        note_id,
        tag_id
    )
    .execute(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(StatusCode::CREATED)
}

// DELETE /api/notes/:id/tags/:tag_id - Remove tag from note
pub async fn remove_tag_from_note(
    State(state): State<AppState>,
    Path((note_id, tag_id)): Path<(Uuid, Uuid)>,
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

    let result = sqlx::query!(
        r#"
        DELETE FROM note_tags
        WHERE note_id = $1 AND tag_id = $2
        "#,
        note_id,
        tag_id
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

// GET /api/notes/:id/tags - Get all tags for a note
pub async fn get_note_tags(
    State(state): State<AppState>,
    Path(note_id): Path<Uuid>,
) -> Result<impl IntoResponse, StatusCode> {
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

    let tags = sqlx::query_as::<_, Tag>(
        r#"
        SELECT t.*
        FROM tags t
        INNER JOIN note_tags nt ON t.id = nt.tag_id
        WHERE nt.note_id = $1
        ORDER BY t.name ASC
        "#
    )
    .bind(note_id)
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(tags))
}
