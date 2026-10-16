import { useState, useMemo } from "react";
import lexicon from "../data/lexicon.json";

const WordList = ({ onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Функция для фильтрации слов внутри одной группы
  const filterWords = (words, term) => {
    if (!term) return words;
    const lowerCaseSearch = term.toLowerCase().trim();

    return words.filter((word) => {
      const matchesLatin = word.text.toLowerCase().includes(lowerCaseSearch);
      const matchesRussian =
        word.translation &&
        word.translation.toLowerCase().includes(lowerCaseSearch);
      return matchesLatin || matchesRussian;
    });
  };

  // Подготавливаем данные: для каждой группы фильтруем слова
  const groupedData = useMemo(() => {
    return lexicon.data
      .map((group) => {
        const filtered = filterWords(group.worlds, searchTerm);
        return {
          ...group,
          worlds: filtered,
          totalCount: group.worlds.length,
          filteredCount: filtered.length,
        };
      })
      .filter((group) => group.filteredCount > 0); // Скрываем пустые группы
  }, [searchTerm]);

  // Общее количество найденных слов (для заголовка)
  const totalFound = useMemo(() => {
    return groupedData.reduce((acc, group) => acc + group.filteredCount, 0);
  }, [groupedData]);

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
        />
      </div>

      {groupedData.map((group) => (
        <div key={group.name} className="group-section">
          <h3 className="group-title">
            {group.name.replace("lexs_min_", "Лексический минимум ")}
            <span className="group-count">
              ({group.filteredCount} из {group.totalCount})
            </span>
          </h3>

          <div className="words-grid">
            {group.worlds.map((word, index) => (
              <div key={index} className="word-card">
                <div className="word-latin">
                  <strong>{word.text}</strong>, {word.ends} {word.gender}
                </div>
                <div className="word-russian">{word.translation}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {totalFound === 0 && <p className="no-results">Ничего не найдено</p>}
    </div>
  );
};

export default WordList;
