import { useState, useMemo, useEffect } from "react";
import { loadMaterialData } from "../../lib/materials";
import DataWarning from "../../components/ui/DataWarning";

const AnatomyTickets = ({ dataFile, onBack }) => {
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [data, setData] = useState(null);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadMaterialData(dataFile).then(({ data, source }) => {
      if (!cancelled) {
        setData(data);
        setSource(source);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [dataFile]);

  const tickets = useMemo(() => data?.data || [], [data]);

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

      <DataWarning source={source} />

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
                type="button"
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
                    <QuestionBlock
                      key={question.number}
                      question={question}
                      onImageClick={setLightboxImage}
                    />
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

      {lightboxImage && (
        <div className="image-lightbox" onClick={() => setLightboxImage(null)}>
          <button
            className="lightbox-close"
            onClick={() => setLightboxImage(null)}
          >
            ✕
          </button>
          <img
            src={lightboxImage}
            alt="Просмотр"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

// ============================================================
// Блок вопроса с картинками-аккордеоном
// ============================================================
const QuestionBlock = ({ question, onImageClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openImageIndex, setOpenImageIndex] = useState(null);

  const paragraphs = question.text.split("\n").filter((p) => p.trim());
  const images = question.images || [];

  const toggleImage = (idx) => {
    setOpenImageIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="question-block">
      <button className="question-header" onClick={() => setIsOpen(!isOpen)}>
        <span className="question-number">{question.number}.</span>
        <span className="question-title">{question.title}</span>
        {images.length > 0 && (
          <span className="question-image-badge" title="Есть изображения">
            🖼 {images.length}
          </span>
        )}
        <span className={`question-chevron ${isOpen ? "open" : ""}`}>▸</span>
      </button>

      {isOpen && (
        <div className="question-answer">
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}

          {images.length > 0 && (
            <div className="question-images">
              <div className="question-images-title">
                Изображения ({images.length})
              </div>

              {images.map((img, i) => {
                const isOpenImg = openImageIndex === i;

                return (
                  <div
                    key={i}
                    className={`question-image-item ${
                      isOpenImg ? "expanded" : ""
                    }`}
                  >
                    <button
                      className="question-image-header"
                      onClick={() => toggleImage(i)}
                      type="button"
                    >
                      <span className="question-image-icon">🖼</span>
                      <span className="question-image-titles">
                        <span className="question-image-title-ru">
                          {img.title_ru}
                        </span>
                        {img.title_en && (
                          <span className="question-image-title-en">
                            {img.title_en}
                          </span>
                        )}
                      </span>
                      <span
                        className={`question-image-chevron ${
                          isOpenImg ? "open" : ""
                        }`}
                      >
                        ▸
                      </span>
                    </button>

                    {isOpenImg && (
                      <div className="question-image-body">
                        <button
                          className="question-image-thumb"
                          onClick={() => onImageClick(img.img)}
                          type="button"
                          title="Открыть на весь экран"
                        >
                          <img src={img.img} alt={img.title_ru} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AnatomyTickets;
