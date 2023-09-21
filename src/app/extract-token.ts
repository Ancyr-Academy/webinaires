export const extractToken = (header: string): string | null => {
  const parts = header.split(' ');

  if (parts[0] !== 'Basic') {
    return null;
  }

  return parts[1];
};
