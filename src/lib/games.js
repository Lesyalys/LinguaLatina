import { supabase } from "./supabase";
import { shuffleArray } from "./shuffle";

// Создать приглашение
export const createGame = async (hostId, guestId, settings) => {
  const { data, error } = await supabase
    .from("games")
    .insert({
      host_id: hostId,
      guest_id: guestId,
      status: "invited",
      settings,
      state: {},
    })
    .select()
    .single();

  if (error) {
    console.error("Ошибка создания игры:", error);
  }
  return { data, error };
};

// Принять
export const acceptGame = async (gameId) => {
  const { data, error } = await supabase
    .from("games")
    .update({ status: "active" })
    .eq("id", gameId)
    .select()
    .single();
  return { data, error };
};

// Отклонить / отменить
export const cancelGame = async (gameId) => {
  const { error } = await supabase
    .from("games")
    .update({ status: "cancelled" })
    .eq("id", gameId);
  return { error };
};

// Обновить состояние (раунд, ответы, счёт)
export const updateGameState = async (gameId, updates) => {
  const { data, error } = await supabase
    .from("games")
    .update(updates)
    .eq("id", gameId)
    .select()
    .single();
  return { data, error };
};

// Завершить
export const finishGame = async (gameId, scoreHost, scoreGuest) => {
  const { error } = await supabase
    .from("games")
    .update({
      status: "finished",
      score_host: scoreHost,
      score_guest: scoreGuest,
      finished_at: new Date().toISOString(),
    })
    .eq("id", gameId);
  return { error };
};

// Получить игру
export const getGame = async (gameId) => {
  const { data, error } = await supabase
    .from("games")
    .select("*")
    .eq("id", gameId)
    .single();
  return { data, error };
};

// Подписаться на игру
export const subscribeToGame = (gameId, callback) => {
  const channel = supabase
    .channel(`game:${gameId}`)
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "games",
        filter: `id=eq.${gameId}`,
      },
      (payload) => callback(payload.new),
    )
    .subscribe();
  return () => supabase.removeChannel(channel);
};

// ============================================================
// Определение победителя раунда
// ============================================================
// Таймстампы ответов приходят с РАЗНЫХ машин, и их системные часы могут
// расходиться на минуты. Поэтому сравниваем не абсолютное время, а
// elapsed — сколько миллисекунд прошло у самого игрока от момента, когда он
// увидел слово, до нажатия. Эта величина измерена «своими» часами на каждом
// клиенте и сравнима между игроками.
export const elapsedSince = (since) =>
  since ? Math.max(0, Date.now() - since) : null;

/**
 * @param {{correct: boolean, elapsed?: number, timestamp?: number}|null} hostAnswer
 * @param {{correct: boolean, elapsed?: number, timestamp?: number}|null} guestAnswer
 * @returns {"host" | "guest" | null}
 */
export const resolveRoundWinner = (hostAnswer, guestAnswer) => {
  if (!hostAnswer || !guestAnswer) return null;

  const hostCorrect = !!hostAnswer.correct;
  const guestCorrect = !!guestAnswer.correct;

  if (hostCorrect && !guestCorrect) return "host";
  if (!hostCorrect && guestCorrect) return "guest";
  if (!hostCorrect && !guestCorrect) return null;

  // Оба правильные — быстрее тот, у кого меньше elapsed.
  // Фолбэк на timestamp для игр, сыгранных до появления elapsed.
  const rank = (a) =>
    typeof a.elapsed === "number" ? a.elapsed : (a.timestamp ?? Infinity);

  const hostRank = rank(hostAnswer);
  const guestRank = rank(guestAnswer);

  if (hostRank < guestRank) return "host";
  if (guestRank < hostRank) return "guest";
  return null; // точное совпадение — ничья
};

// Сгенерировать очередь слов
export const buildWordQueue = (lexicon, groupNames, count) => {
  const allWords = [];
  lexicon.data.forEach((group) => {
    if (!groupNames.includes(group.name)) return;
    group.worlds.forEach((w) => allWords.push(w));
  });

  // Перемешать
  const shuffled = shuffleArray(allWords);
  const selected = shuffled.slice(0, count);

  // Для каждого — 4 варианта (1 правильный + 3 дистрактора)
  return selected.map((word) => {
    const distractors = shuffleArray(
      allWords.filter((w) => w.text !== word.text),
    ).slice(0, 3);

    const options = shuffleArray([
      word.text,
      ...distractors.map((d) => d.text),
    ]);

    return {
      translation: word.translation,
      correct: word.text,
      options,
    };
  });
};
