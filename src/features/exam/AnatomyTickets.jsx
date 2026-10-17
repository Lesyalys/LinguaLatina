import React, { useState, useMemo, useEffect } from "react";
import { loadMaterialData } from "../../lib/materials";

const AnatomyTickets = ({ dataFile, onBack }) => {
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ Хук #1
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadMaterialData(dataFile).then((result) => {
      if (!cancelled) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataFile]);

  // ✅ Хук #2
  const tickets = useMemo(() => data?.data || [], [data]);

  // ✅ Хук #3
  const filteredTickets = useMemo(() => {
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase().trim();

    return tickets.filter((ticket) =>
      ticket.questions.some(
        (question) =>
          question.title.toLowerCase().includes(q) ||
          question.text.toLowerCase().includes(q),
      ),
    );
  }, [tickets, searchQuery]);

  // ✅ Все хуки — выше. Можно return.
  if (loading) return <div className="app-loading">Загрузка...</div>;
  if (!data)
    return <div className="page-placeholder">Не удалось загрузить данные</div>;

  const toggleTicket = (ticketNumber) => {
    setExpandedTicket((prev) => (prev === ticketNumber ? null : ticketNumber));
  };

  return (
    <div className="anatomy-page">
      <div className="anatomy-header">
        <button className="back-btn" onClick={onBack}>
          ← Назад
        </button>
        <h1 className="page-title">Анатомия</h1>
        <span className="tickets-count">
          {filteredTickets.length} / {tickets.length} билетов
        </span>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Поиск по вопросам и ответам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="tickets-list">
        {filteredTickets.map((ticket) => {
          const isExpanded = expandedTicket === ticket.ticket;

          return (
            <div
              key={ticket.ticket}
              className={`ticket-card ${isExpanded ? "expanded" : ""}`}
            >
              <button
                className="ticket-header"
                onClick={() => toggleTicket(ticket.ticket)}
              >
                <span className="ticket-number">Билет №{ticket.ticket}</span>
                <span className="ticket-questions-count">
                  {ticket.questions.length} вопроса
                </span>
                <span className="ticket-chevron">▸</span>
              </button>

              {isExpanded && (
                <div className="ticket-questions">
                  {ticket.questions.map((question) => (
                    <QuestionBlock key={question.number} question={question} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {filteredTickets.length === 0 && (
          <div className="no-results">
            <p>Ничего не найдено</p>
          </div>
        )}
      </div>
    </div>
  );
};

const QuestionBlock = ({ question }) => {
  const [isOpen, setIsOpen] = useState(false);
  const paragraphs = question.text.split("\n").filter((p) => p.trim());

  return (
    <div className="question-block">
      <button className="question-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="question-number">{question.number}.</span>
        <span className="question-title">{question.title}</span>
        <span className={`question-chevron ${isOpen ? "open" : ""}`}>▸</span>
      </button>

      {isOpen && (
        <div className="question-answer">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
    </div>
  );
};

export default AnatomyTickets;
