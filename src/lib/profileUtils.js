// src/lib/profileUtils.js

export const getInitials = (profile) => {
  if (!profile) return "?";
  return (profile.display_name || profile.username || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export const formatMemberSince = (createdAt) => {
  if (!createdAt) return "";
  return new Date(createdAt).toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
  });
};

export const EXP_TARGET = 1000;

export const calcExpPercent = (wordsLearned = 0) =>
  Math.min(100, Math.round((wordsLearned / EXP_TARGET) * 100));
