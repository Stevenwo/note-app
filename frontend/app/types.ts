export interface Tag {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface TagWithCount extends Tag {
  note_count: number
}

export interface Note {
  id: string
  user_id: string
  notebook_id?: string
  title: string
  content: string
  thumbnail_url?: string
  is_starred: boolean
  is_web_clip: boolean
  web_clip_url?: string
  created_at: string
  updated_at: string
  tags?: Tag[]
}

export interface CreateTagRequest {
  name: string
  color?: string
}

export interface UpdateTagRequest {
  name?: string
  color?: string
}

export interface Notebook {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
  updated_at: string
}

export interface NotebookWithCount extends Notebook {
  note_count: number
}

export interface CreateNotebookRequest {
  name: string
  color?: string
}

export interface UpdateNotebookRequest {
  name?: string
  color?: string
}
