// src/lib/profileUtils.js
export const getInitials = (profile) => {
  const name = profile?.display_name || profile?.username || "?";
  return name
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

export const calcExpPercent = (wordsLearned = 0) => {
  const target = 1000;
  return Math.min(100, Math.round((wordsLearned / target) * 100));
};
