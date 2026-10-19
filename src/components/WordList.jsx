import { useMemo, useState } from "react";
import { lexminGroups, formatGroupName } from "../constants/lexicon";
import { normalize } from "../lib/utils";

// Чистая функция вне компонента: фильтр слов одной группы
// по латыни и русскому переводу (с поддержкой ё/е).
function filterWords(words, term) {
  if (!term) return words;
  const query = normalize(term);

  return words.filter((word) => {
    const matchesLatin = normalize(word.text).includes(query);
    const matchesRussian =
      word.translation && normalize(word.translation).includes(query);
    return matchesLatin || matchesRussian;
  });
}

const WordList = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Подготавливаем данные: для каждой группы фильтруем слова
  const groupedData = useMemo(() => {
    return lexminGroups
      .map((group) => {
        const filtered = filterWords(group.words, searchTerm);
        return {
          ...group,
          filtered,
          totalCount: group.words.length,
          filteredCount: filtered.length,
        };
      })
      .filter((group) => group.filteredCount > 0); // Скрываем пустые группы
  }, [searchTerm]);

  // Общее количество найденных слов (для заголовка)
  const totalFound = useMemo(
    () => groupedData.reduce((acc, group) => acc + group.filteredCount, 0),
    [groupedData],
  );

  return (
    <div className="wordlist-container">
      <div className="header">
        <button onClick={onBack} className="back-btn">
          ← Назад
        </button>
        <h2>Список слов ({totalFound})</h2>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Поиск по латинскому или русскому слову..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Поиск слов"
        />
      </div>

      {groupedData.map((group) => (
        <section key={group.id} className="group-section">
          <h3 className="group-title">
            {formatGroupName(group.id)}
            <span className="group-count">
              ({group.filteredCount} из {group.totalCount})
            </span>
          </h3>

          <div className="words-grid">
            {group.filtered.map((word) => (
              <article key={`${group.id}-${word.text}`} className="word-card">
                <div className="word-latin">
                  <strong>{word.text}</strong>, {word.ends} {word.gender}
                </div>
                <div className="word-russian">{word.translation}</div>
              </article>
            ))}
          </div>
        </section>
      ))}

      {totalFound === 0 && <p className="no-results">Ничего не найдено</p>}
    </div>
  );
};

export default WordList;
