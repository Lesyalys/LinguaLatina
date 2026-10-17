// src/lib/rooms.js

export const ROOM_CODES = {
  А: {
    name: "Корпус на ул. Энергетиков, д. 22",
    address: "ул. Энергетиков, д. 22",
    short: "Корпус А",
    type: "building",
  },
  У: {
    name: "Корпус на ул. Энергетиков, д. 22 (блок В)",
    address: "ул. Энергетиков, д. 22, блок В",
    short: "Корпус У",
    type: "building",
  },
  Г: {
    name: "Корпус на ул. Энергетиков, д. 8",
    address: "ул. Энергетиков, д. 8",
    short: "Корпус Г",
    type: "building",
  },
  К: {
    name: "Корпус на пр. Ленина, д. 1",
    address: "пр. Ленина, д. 1",
    short: "Корпус К",
    type: "building",
  },
  С: {
    name: "Спорткомплекс «Дружба»",
    address: "ул. 50 лет ВЛКСМ, д. 9а",
    short: "Спорткомплекс",
    type: "sport",
  },
  СОКБ: {
    name: "Сургутская окружная клиническая больница",
    address: "ул. Энергетиков, д. 24",
    short: "СОКБ",
    type: "hospital",
  },
  СКТБ: {
    name: "Сургутская клиническая травматологическая больница",
    address: "Нефтеюганское шоссе, 20",
    short: "СКТБ",
    type: "hospital",
  },
  СГКБ: {
    name: "Сургутская городская клиническая больница",
    address: "ул. Губкина, д. 1",
    short: "СГКБ",
    type: "hospital",
  },
  СОКЦОМиД: {
    name: "Сургутский окружной клинический центр охраны материнства и детства",
    address: "пр. Пролетарский, д. 15",
    short: "СОКЦОМиД",
    type: "hospital",
  },
  Водолей: {
    name: "Бассейн «Водолей»",
    address: "ул. 30 лет Победы, д. 22а",
    short: "Бассейн",
    type: "sport",
  },
  ЭОиДОТ: {
    name: "Электронная информационно-образовательная среда с применением электронного обучения и дистанционных образовательных технологий",
    address: null,
    short: "Дистант",
    type: "remote",
  },
};

/**
 * Пытается извлечь код аудитории из строки.
 * Примеры: "А-101", "СОКБ", "У 203", "ЭОиДОТ", "Г-12"
 * Возвращает { code, rest } или null.
 */
export function parseRoomCode(room) {
  if (!room) return null;
  const trimmed = room.trim();

  // 1) Точное совпадение
  if (ROOM_CODES[trimmed]) {
    return { code: trimmed, rest: "" };
  }

  // 2) Код с дефисом/пробелом и номером: "А-101", "А 101"
  const match = trimmed.match(/^([А-Яа-яЁёA-Za-z]+)[\s-]*(.*)$/);
  if (match) {
    const [, rawCode, rest] = match;
    // Приоритет длинным кодам (СОКЦОМиД, Водолей, ЭОиДОТ)
    const candidates = Object.keys(ROOM_CODES).sort(
      (a, b) => b.length - a.length,
    );
    for (const code of candidates) {
      if (rawCode.toUpperCase() === code.toUpperCase()) {
        return { code, rest };
      }
    }
    // Если это одиночная буква из известных — принимаем
    if (ROOM_CODES[rawCode.toUpperCase()]) {
      return { code: rawCode.toUpperCase(), rest };
    }
  }

  return null;
}
