export default function formatDateTime(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const time = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    hour12: true,
    minute: undefined,
  });
  return `${date.toLocaleDateString("en-US", options)} ${time.toLowerCase()}`;
}
