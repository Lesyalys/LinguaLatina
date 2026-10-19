// Тонкая обёртка над localStorage: единая точка доступа, безопасное чтение/запись.
const PROGRESS_KEY = "latinus.progress.v1";

export function loadProgress() {
  try {
    const raw = localStorage.getItem(PROGRESS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    // повреждённые данные или недоступный storage (приватный режим) — не роняем приложение
    return null;
  }
}

export function saveProgress(progress) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // хранилище переполнено/недоступно — прогресс просто не сохранится
  }
}
