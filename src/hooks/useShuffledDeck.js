import { useCallback, useState } from "react";
import { shuffle } from "../lib/utils";

/**
 * Перемешанная колода карточек.
 *
 * Ключевое отличие от прежнего useMemo: перемешивание происходит НЕ во время
 * рендера, а в обработчике/иниализаторе — поэтому React 19 + eslint-plugin-react-hooks@7
 * больше не считает это impure-вызовом, а кнопка «Начать заново» работает без
 * window.location.reload().
 */
export function useShuffledDeck(words) {
  const [deck, setDeck] = useState(() => shuffle(words));

  const reshuffle = useCallback(() => {
    setDeck(shuffle(words));
  }, [words]);

  return { deck, reshuffle };
}
