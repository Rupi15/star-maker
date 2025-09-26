const normalizeHistoryEntry = (entry) => {
  if (!entry) {
    return null;
  }

  if (typeof entry === 'string') {
    const trimmed = entry.trim();
    return trimmed ? { message: trimmed, createdAt: null } : null;
  }

  if (typeof entry === 'object') {
    const messageSource = entry.message ?? entry.content ?? entry.text ?? '';
    const message = typeof messageSource === 'string' ? messageSource.trim() : String(messageSource ?? '').trim();

    if (!message) {
      return null;
    }

    const rawTimestamp = entry.createdAt ?? entry.created_at ?? entry.timestamp ?? null;
    const createdAt = typeof rawTimestamp === 'string' ? rawTimestamp : null;

    return {
      message,
      createdAt,
    };
  }

  return null;
};

export const parseHistoryData = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map(normalizeHistoryEntry).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    try {
      const parsed = JSON.parse(trimmed);
      return parseHistoryData(parsed);
    } catch (error) {
      const normalized = normalizeHistoryEntry(trimmed);
      return normalized ? [normalized] : [];
    }
  }

  if (typeof value === 'object') {
    const normalized = normalizeHistoryEntry(value);
    return normalized ? [normalized] : [];
  }

  return [];
};

export const createHistoryEntry = (message) => ({
  message,
  createdAt: new Date().toISOString(),
});

export const formatHistoryTimestamp = (isoString) => {
  if (!isoString) {
    return '';
  }

  const date = new Date(isoString);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};