use axum::{
    extract::{State, Query, Path},
    http::StatusCode,
    response::IntoResponse,
    Json,
};
use serde::Deserialize;
use uuid::Uuid;

use crate::{models::*, AppState};

#[derive(Deserialize)]
pub struct ListNotesQuery {
    search: Option<String>,
    limit: Option<i64>,
    sort: Option<String>,
    order: Option<String>,
}

pub async fn list_notes(
    State(state): State<AppState>,
    Query(params): Query<ListNotesQuery>,
) -> Result<impl IntoResponse, StatusCode> {
    // TODO: Add user authentication - for now using hardcoded user
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();
    
    let limit = params.limit.unwrap_or(1000); // Increased default limit

    let order_clause = match params.sort.as_deref() {
        Some("title") => "ORDER BY LOWER(title)",
        Some("is_starred") => "ORDER BY is_starred DESC, created_at",
        _ => "ORDER BY created_at"
    };
    let direction = if params.order.as_deref() == Some("asc") { "ASC" } else { "DESC" };
    let order_by = format!("{} {}", order_clause, direction);

    let notes = if let Some(search_term) = params.search {
        // Search in title and content
        let query = format!(
            r#"
            SELECT * FROM notes 
            WHERE user_id = $1 
            AND (title ILIKE $2 OR content ILIKE $2)
            {} 
            LIMIT $3
            "#,
            order_by
        );
        sqlx::query_as::<_, Note>(&query)
        .bind(user_id)
        .bind(format!("%{}%", search_term))
        .bind(limit)
        .fetch_all(&state.db)
        .await
    } else {
        // No search, return all notes
        let query = format!("SELECT * FROM notes WHERE user_id = $1 {} LIMIT $2", order_by);
        sqlx::query_as::<_, Note>(&query)
        .bind(user_id)
        .bind(limit)
        .fetch_all(&state.db)
        .await
    }
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(notes))
}

pub async fn create_note(
    State(state): State<AppState>,
    Json(payload): Json<CreateNoteRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();

    let note = sqlx::query_as::<_, Note>(
        r#"
        INSERT INTO notes (user_id, notebook_id, title, content, is_starred, is_web_clip, web_clip_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
        "#
    )
    .bind(user_id)
    .bind(payload.notebook_id)
    .bind(&payload.title)
    .bind(&payload.content)
    .bind(payload.is_starred.unwrap_or(false))
    .bind(payload.is_web_clip.unwrap_or(false))
    .bind(payload.web_clip_url)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok((StatusCode::CREATED, Json(note)))
}

// Delete note endpoint
pub async fn delete_note(
    State(state): State<AppState>,
    Path(note_id): Path<Uuid>,
) -> Result<StatusCode, StatusCode> {
    // TODO: Add user authentication - for now using hardcoded user
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();
    
    let result = sqlx::query!(
        r#"
        DELETE FROM notes
        WHERE id = $1 AND user_id = $2
        "#,
        note_id,
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

// Toggle star/favorite endpoint
pub async fn toggle_star_note(
    State(state): State<AppState>,
    Path(note_id): Path<Uuid>,
) -> Result<Json<Note>, StatusCode> {
    // TODO: Add user authentication - for now using hardcoded user
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap();
    
    // First, get the current starred state
    let note = sqlx::query_as::<_, Note>(
        r#"
        SELECT id, user_id, notebook_id, title, content, thumbnail_url,
               is_starred, is_web_clip, web_clip_url, created_at, updated_at
        FROM notes
        WHERE id = $1 AND user_id = $2
        "#
    )
    .bind(note_id)
    .bind(user_id)
    .fetch_optional(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let note = note.ok_or(StatusCode::NOT_FOUND)?;

    // Toggle the starred state
    let updated_note = sqlx::query_as::<_, Note>(
        r#"
        UPDATE notes
        SET is_starred = $1, updated_at = NOW()
        WHERE id = $2 AND user_id = $3
        RETURNING id, user_id, notebook_id, title, content, thumbnail_url,
                  is_starred, is_web_clip, web_clip_url, created_at, updated_at
        "#
    )
    .bind(!note.is_starred)
    .bind(note_id)
    .bind(user_id)
    .fetch_one(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(updated_note))
}

#[derive(Deserialize)]
pub struct SearchParams {
    pub q: String,
    pub user_id: Option<Uuid>,
    pub limit: Option<i64>,
    pub offset: Option<i64>,
    pub sort: Option<String>,
    pub order: Option<String>,
}

pub async fn search_notes(
    State(state): State<AppState>,
    Query(params): Query<SearchParams>,
) -> Result<Json<Vec<Note>>, StatusCode> {
    let user_id = params.user_id.unwrap_or_else(|| Uuid::parse_str("00000000-0000-0000-0000-000000000001").unwrap());
    let limit = params.limit.unwrap_or(100);
    let offset = params.offset.unwrap_or(0);
    let search_query = format!("%{}%", params.q.to_lowercase());

    let order_clause = match params.sort.as_deref() {
        Some("title") => "ORDER BY LOWER(title)",
        Some("is_starred") => "ORDER BY is_starred DESC, created_at",
        _ => "ORDER BY created_at"
    };
    let direction = if params.order.as_deref() == Some("asc") { "ASC" } else { "DESC" };
    let order_by = format!("{} {}", order_clause, direction);

    let query = format!(
        r#"
        SELECT * FROM notes
        WHERE user_id = $1
        AND (LOWER(title) ILIKE $2 OR LOWER(content) ILIKE $2)
        {} 
        LIMIT $3 OFFSET $4
        "#,
        order_by
    );

    let notes = sqlx::query_as::<_, Note>(&query)
    .bind(user_id)
    .bind(search_query)
    .bind(limit)
    .bind(offset)
    .fetch_all(&state.db)
    .await
    .map_err(|e| {
        tracing::error!("Database error in search_notes: {}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(notes))
}
