import { useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const ProfileEdit = ({ profile, onCancel, onSaved }) => {
  const { user, updateProfile, uploadImage } = useAuth();

  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [username, setUsername] = useState(profile?.username || "");
  const [bio, setBio] = useState(profile?.bio || "");

  const [avatarPreview, setAvatarPreview] = useState(profile?.avatar_url || "");
  const [coverPreview, setCoverPreview] = useState(profile?.cover_url || "");

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // Проверка, изменилось ли что-то
  const isDirty =
    displayName !== (profile?.display_name || "") ||
    username !== (profile?.username || "") ||
    bio !== (profile?.bio || "") ||
    avatarFile !== null ||
    coverFile !== null;

  // ============================================================
  // Обработка выбора изображения с кропом
  // ============================================================
  const handleImageSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Можно загружать только изображения");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Файл слишком большой (макс. 5 МБ)");
      return;
    }

    setError("");

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Аватар: квадрат 400x400
        // Шапка: 1200x400
        const targetWidth = type === "avatar" ? 400 : 1200;
        const targetHeight = type === "avatar" ? 400 : 400;

        const canvas = document.createElement("canvas");
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        const ctx = canvas.getContext("2d");

        // Вычисляем параметры кропа (cover)
        const scale = Math.max(
          targetWidth / img.width,
          targetHeight / img.height,
        );
        const newWidth = img.width * scale;
        const newHeight = img.height * scale;
        const offsetX = (targetWidth - newWidth) / 2;
        const offsetY = (targetHeight - newHeight) / 2;

        ctx.drawImage(img, offsetX, offsetY, newWidth, newHeight);

        canvas.toBlob(
          (blob) => {
            const croppedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });

            if (type === "avatar") {
              setAvatarFile(croppedFile);
              setAvatarPreview(URL.createObjectURL(blob));
            } else {
              setCoverFile(croppedFile);
              setCoverPreview(URL.createObjectURL(blob));
            }
          },
          "image/jpeg",
          0.9,
        );
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // ============================================================
  // Сохранение
  // ============================================================
  const handleSave = async () => {
    setError("");
    setSuccess("");

    // Валидация
    if (!username || username.length < 3) {
      setError("Логин должен быть не короче 3 символов");
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      setError("Логин может содержать только латиницу, цифры и _");
      return;
    }
    if (displayName.length > 50) {
      setError("Имя не должно превышать 50 символов");
      return;
    }
    if (bio.length > 300) {
      setError("Био не должно превышать 300 символов");
      return;
    }

    setSaving(true);

    try {
      // 1. Проверяем уникальность username (если изменился)
      if (username !== profile.username) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("username", username)
          .neq("id", user.id)
          .maybeSingle();

        if (existing) {
          throw new Error("Этот логин уже занят");
        }
      }

      // 2. Загружаем изображения (если выбраны)
      let avatarUrl = profile.avatar_url;
      let coverUrl = profile.cover_url;

      if (avatarFile) {
        const { url, error: uploadErr } = await uploadImage(
          avatarFile,
          "avatars",
        );
        if (uploadErr) throw uploadErr;
        avatarUrl = url;
      }

      if (coverFile) {
        const { url, error: uploadErr } = await uploadImage(
          coverFile,
          "covers",
        );
        if (uploadErr) throw uploadErr;
        coverUrl = url;
      }

      // 3. Обновляем профиль
      const { error: updateErr } = await updateProfile({
        username,
        display_name: displayName,
        bio,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
      });

      if (updateErr) throw updateErr;

      setSuccess("Профиль сохранён!");
      setTimeout(() => onSaved(), 800);
    } catch (err) {
      console.error(err);
      setError(err.message || "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-page">
      <h1 className="page-title">Редактирование профиля</h1>

      <div className="profile-edit-card">
        {/* ======================== ШАПКА ======================== */}
        <div className="edit-section">
          <label className="edit-label">Шапка профиля</label>
          <div
            className="edit-cover"
            style={
              coverPreview
                ? { backgroundImage: `url(${coverPreview})` }
                : undefined
            }
            onClick={() => coverInputRef.current?.click()}
          >
            <div className="edit-cover-overlay">
              <span className="edit-cover-btn">
                📷 {coverPreview ? "Изменить" : "Загрузить"}
              </span>
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageSelect(e, "cover")}
            hidden
          />
          <p className="edit-hint">Рекомендуется 1200×400. JPG, PNG до 5 МБ.</p>
        </div>

        {/* ======================== АВАТАР ======================== */}
        <div className="edit-section">
          <label className="edit-label">Аватар</label>
          <div className="edit-avatar-row">
            <div
              className="edit-avatar"
              onClick={() => avatarInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="avatar preview" />
              ) : (
                <span className="edit-avatar-placeholder">👤</span>
              )}
              <div className="edit-avatar-overlay">📷</div>
            </div>
            <div className="edit-avatar-info">
              <button
                type="button"
                className="profile-action-btn primary"
                onClick={() => avatarInputRef.current?.click()}
              >
                Выбрать файл
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  className="profile-action-btn danger"
                  onClick={() => {
                    setAvatarFile(null);
                    setAvatarPreview("");
                  }}
                >
                  Удалить
                </button>
              )}
              <p className="edit-hint">Квадратное изображение, мин. 200×200.</p>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageSelect(e, "avatar")}
              hidden
            />
          </div>
        </div>

        {/* ======================== ЛОГИН ======================== */}
        <div className="edit-section">
          <label className="edit-label" htmlFor="username">
            Логин
          </label>
          <input
            id="username"
            type="text"
            className="edit-input"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            placeholder="marcus_aurelius"
            maxLength={30}
          />
          <p className="edit-hint">
            Только латиница, цифры и _. От 3 до 30 символов.
          </p>
        </div>

        {/* ======================== ИМЯ ======================== */}
        <div className="edit-section">
          <label className="edit-label" htmlFor="displayName">
            Отображаемое имя
          </label>
          <input
            id="displayName"
            type="text"
            className="edit-input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Марк Аврелий"
            maxLength={50}
          />
          <p className="edit-hint">До 50 символов.</p>
        </div>

        {/* ======================== БИО ======================== */}
        <div className="edit-section">
          <label className="edit-label" htmlFor="bio">
            О себе
          </label>
          <textarea
            id="bio"
            className="edit-input edit-textarea"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Студент-медик, изучаю латынь для анатомии..."
            rows={4}
            maxLength={300}
          />
          <p className="edit-hint">{bio.length}/300 символов.</p>
        </div>

        {/* ======================== СООБЩЕНИЯ ======================== */}
        {error && <div className="auth-error">⚠ {error}</div>}
        {success && <div className="auth-message">✓ {success}</div>}

        {/* ======================== КНОПКИ ======================== */}
        <div className="profile-edit-actions">
          <button
            className="profile-action-btn"
            onClick={onCancel}
            disabled={saving}
          >
            Отмена
          </button>
          <button
            className="profile-action-btn primary"
            onClick={handleSave}
            disabled={saving || !isDirty}
          >
            {saving ? "Сохранение..." : "💾 Сохранить"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;
