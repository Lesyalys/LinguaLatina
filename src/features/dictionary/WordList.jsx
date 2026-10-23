import { useState, useMemo, useEffect } from "react";
import { loadMaterialData } from "../../lib/materials";
import DataWarning from "../../components/ui/DataWarning";

const WordList = ({ dataFile, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [lexicon, setLexicon] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadMaterialData(dataFile).then(({ data, source }) => {
      if (!cancelled) {
        setLexicon(data);
        setSource(source);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataFile]);

  const groupedData = useMemo(() => {
    if (!lexicon?.data) return [];
    const filterWords = (words, term) => {
      if (!term) return words;
      const q = term.toLowerCase().trim();
      return words.filter(
        (w) =>
          w.text.toLowerCase().includes(q) ||
          (w.translation && w.translation.toLowerCase().includes(q)),
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
      .filter((g) => g.filteredCount > 0);
  }, [lexicon, searchTerm]);

  const totalFound = useMemo(
    () => groupedData.reduce((acc, g) => acc + g.filteredCount, 0),
    [groupedData],
  );

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

      {/* ⚠️ Предупреждение о локальных данных */}
      <DataWarning source={source} />

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
