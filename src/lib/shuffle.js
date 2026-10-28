// Равномерное перемешивание (Fisher–Yates) без мутации исходного массива.
// sort(() => Math.random() - 0.5) даёт смещение, поэтому используем этот алгоритм.
export const shuffleArray = (items) => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
