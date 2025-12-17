const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export async function fetchNotePoints(limit = 1000) {
  const response = await fetch(`${API_BASE_URL}/notes/points?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch note points');
  }
  return response.json();
}

export async function createNote(noteData) {
  const response = await fetch(`${API_BASE_URL}/notes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(noteData),
  });

  if (response.status === 429) {
    const retryAfter = response.headers.get('Retry-After');
    const error = new Error('Rate limit exceeded');
    error.retryAfter = retryAfter;
    throw error;
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.detail || 'Failed to create note');
  }

  return response.json();
}

export async function fetchNotes(cursor = null, limit = 20) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) {
    params.append('cursor', cursor);
  }

  const response = await fetch(`${API_BASE_URL}/notes?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch notes');
  }
  return response.json();
}
