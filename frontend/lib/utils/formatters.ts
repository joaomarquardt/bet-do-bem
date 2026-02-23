export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatTimeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'agora';
  if (minutes < 60) return `${minutes}min`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function formatDeadline(dateStr: string): string {
  const now = new Date();
  const deadline = new Date(dateStr);
  const diff = deadline.getTime() - now.getTime();

  if (diff <= 0) return 'Encerrado';

  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h restantes`;
  if (hours > 0) return `${hours}h restantes`;
  return 'Menos de 1h';
}

export function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR');
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
