import { useState, useMemo, useEffect } from "react";
import { loadMaterialData } from "../../lib/materials";

const WordList = ({ dataFile, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [lexicon, setLexicon] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Хук #1
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadMaterialData(dataFile).then((data) => {
      if (!cancelled) {
        setLexicon(data);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataFile]);

  // ✅ Хук #2 — useMemo до любых return
  const groupedData = useMemo(() => {
    if (!lexicon?.data) return [];

    const filterWords = (words, term) => {
      if (!term) return words;
      const q = term.toLowerCase().trim();
      return words.filter(
        (word) =>
          word.text.toLowerCase().includes(q) ||
          (word.translation && word.translation.toLowerCase().includes(q)),
      );
    };

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
      .filter((group) => group.filteredCount > 0);
  }, [lexicon, searchTerm]);

  // ✅ Хук #3
  const totalFound = useMemo(
    () => groupedData.reduce((acc, group) => acc + group.filteredCount, 0),
    [groupedData],
  );

  // ✅ Все хуки закончились. Теперь можно return.
  if (loading) return <div className="app-loading">Загрузка...</div>;
  if (!lexicon)
    return <div className="page-placeholder">Не удалось загрузить данные</div>;

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
