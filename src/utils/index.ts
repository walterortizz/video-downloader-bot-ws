export function formatTime(seconds: number): string {
  if (!seconds) return '0';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  let timeString = '';

  if (minutes > 0) {
    timeString += `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }

  if (remainingSeconds > 0) {
    if (minutes > 0) {
      timeString += ', ';
    }
    timeString += `${remainingSeconds} ${remainingSeconds === 1 ? 'segundo' : 'segundos'}`;
  }

  return timeString || '0 segundos';
}

export function formatNumberWithDots(number: number): string {
  if (!number) return '0';
  return number.toLocaleString('es');
}
