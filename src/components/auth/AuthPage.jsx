import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const AuthPage = () => {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (mode === "signup") {
        if (username.length < 3) {
          throw new Error("Логин должен быть не короче 3 символов");
        }
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
          throw new Error("Логин может содержать только латиницу, цифры и _");
        }

        const { error } = await signUp(email, password, username);
        if (error) throw error;

        setMessage(
          "Регистрация успешна! Проверь почту, если включено подтверждение.",
        );
      } else {
        const { error } = await signIn(email, password);
        if (error) throw error;
      }
    } catch (err) {
      setError(err.message || "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
    setError("");
    setMessage("");
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Lingua Latina</h1>
          <p>{mode === "signin" ? "Войдите в аккаунт" : "Создайте аккаунт"}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <div className="auth-field">
              <label>Логин</label>
              <input
                type="text"
                placeholder="например, marcus_aurelius"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                autoComplete="username"
              />
            </div>
          )}

          <div className="auth-field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="auth-field">
            <label>Пароль</label>
            <input
              type="password"
              placeholder="Минимум 6 символов"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={
                mode === "signin" ? "current-password" : "new-password"
              }
            />
          </div>

          {error && <div className="auth-error">⚠ {error}</div>}
          {message && <div className="auth-message">✓ {message}</div>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Загрузка..."
              : mode === "signin"
                ? "Войти"
                : "Зарегистрироваться"}
          </button>
        </form>

        <button type="button" className="auth-switch" onClick={switchMode}>
          {mode === "signin"
            ? "Нет аккаунта? Зарегистрироваться"
            : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
};

export default AuthPage;
