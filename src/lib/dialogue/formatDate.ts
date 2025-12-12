/**
 * Format a date for display in the UI
 * Shows relative time for recent dates, absolute date for older ones
 */
export function formatDate(date: Date): string {
  const now = new Date();
  const dialogueDate = new Date(date);
  const diffInMs = now.getTime() - dialogueDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "Today";
  } else if (diffInDays === 1) {
    return "Yesterday";
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return dialogueDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: dialogueDate.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  }
}
