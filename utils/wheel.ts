
export const getRandomColor = (index: number, totalColors: string[]): string => {
  return totalColors[index % totalColors.length];
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};
