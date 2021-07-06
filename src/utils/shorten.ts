export const shorten = (text: string, maxLen = 2000): string => (text.length > maxLen ? `${text.substr(0, maxLen - 3)}...` : text);
