import { useState, useMemo } from "react";
import { useMaterialData } from "../../hooks/useMaterialData";
import DataWarning from "../../components/ui/DataWarning";

const WordList = ({ dataFile, onBack }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: lexicon, source, loading } = useMaterialData(dataFile);

  // 📂 Состояние раскрытых групп (по умолчанию — все раскрыты)
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());

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

  // 🔀 Переключить группу
  const toggleGroup = (groupName) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) next.delete(groupName);
      else next.add(groupName);
      return next;
    });
  };

  // 📂 Свернуть / развернуть все
  const collapseAll = () => {
    setCollapsedGroups(new Set(groupedData.map((g) => g.name)));
  };

  const expandAll = () => {
    setCollapsedGroups(new Set());
  };

  const allCollapsed =
    groupedData.length > 0 &&
    groupedData.every((g) => collapsedGroups.has(g.name));

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

      <DataWarning source={source} />

      <div className="search-box">
        <input
          type="text"
          placeholder="Поиск по латинскому или русскому слову..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* 📂 Управление всеми группами */}
      {groupedData.length > 0 && (
        <div className="group-controls">
          <button
            type="button"
            className="group-control-btn"
            onClick={allCollapsed ? expandAll : collapseAll}
          >
            {allCollapsed ? "📂 Развернуть все" : "📁 Свернуть все"}
          </button>
        </div>
      )}

      {groupedData.map((group) => {
        const isCollapsed = collapsedGroups.has(group.name);

        return (
          <div key={group.name} className="group-section">
            <button
              type="button"
              className="group-title group-title--toggle"
              onClick={() => toggleGroup(group.name)}
            >
              <span className="group-title-text">
                <span className={`group-chevron ${isCollapsed ? "" : "open"}`}>
                  ▸
                </span>
                {group.name.replace("lexs_min_", "Лексический минимум ")}
              </span>
              <span className="group-count">
                ({group.filteredCount} из {group.totalCount})
              </span>
            </button>

            {!isCollapsed && (
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
            )}
          </div>
        );
      })}

      {totalFound === 0 && <p className="no-results">Ничего не найдено</p>}
    </div>
  );
};

export default WordList;
