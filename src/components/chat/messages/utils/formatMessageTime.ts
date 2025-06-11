/**
 * Formats message timestamp for display
 */
export const formatMessageTime = (date: Date): string => {
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}; 