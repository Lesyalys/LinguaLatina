import { supabase } from "./supabase";

// Создать приглашение
export const createGame = async (hostId, guestId, settings) => {
  console.log("Создаю игру с hostId:", hostId); // Проверь, что hostId не null
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
    console.error("Ошибка создания игры:", error); // Это покажет реальную причину
  } else {
    console.log("Игра создана:", data);
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

// Сгенерировать очередь слов
export const buildWordQueue = (lexicon, groupNames, count) => {
  const allWords = [];
  lexicon.data.forEach((group) => {
    if (!groupNames.includes(group.name)) return;
    group.worlds.forEach((w) => allWords.push(w));
  });

  // Перемешать
  const shuffled = [...allWords].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  // Для каждого — 4 варианта (1 правильный + 3 дистрактора)
  return selected.map((word) => {
    const distractors = allWords
      .filter((w) => w.text !== word.text)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);

    const options = [word.text, ...distractors.map((d) => d.text)].sort(
      () => Math.random() - 0.5,
    );

    return {
      translation: word.translation,
      correct: word.text,
      options,
    };
  });
};
