import { Course, Task } from '../types';

function toUtcCalendarStamp(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return (
    `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}` +
    `T${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}${pad(date.getUTCSeconds())}Z`
  );
}

function getDeadlineEventRange(dueStr: string): { start: Date; end: Date } {
  const end = new Date(dueStr);
  const start = new Date(end.getTime() - 60 * 60 * 1000); // 1-hour reminder block ending at deadline
  return { start, end };
}

function buildDescription(task: Task, course?: Course): string {
  const lines = [
    `Mata Kuliah: ${course?.name ?? '-'} (${course?.code ?? '-'})`,
    `Sesi: ${task.session}`,
    `Kategori: ${task.category} (${task.type})`,
    `Bobot: ${task.weight}`,
    `Mulai: ${task.start.replace('T', ' ')}`,
    `Deadline: ${task.due.replace('T', ' ')}`,
  ];
  if (task.notes) {
    lines.push('', `Catatan: ${task.notes}`);
  }
  return lines.join('\n');
}

export function getGoogleCalendarUrl(task: Task, course?: Course): string {
  const { start, end } = getDeadlineEventRange(task.due);
  const title = `[${course?.code ?? 'TUGAS'}] ${task.name} (${task.session})`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toUtcCalendarStamp(start)}/${toUtcCalendarStamp(end)}`,
    details: buildDescription(task, course),
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

export function downloadTaskIcs(task: Task, course?: Course): void {
  const { start, end } = getDeadlineEventRange(task.due);
  const title = `[${course?.code ?? 'TUGAS'}] ${task.name} (${task.session})`;
  const description = buildDescription(task, course);

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Course Assignment Timeline Tracker//ID',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:task-${task.id}-${start.getTime()}@course-timeline`,
    `DTSTAMP:${toUtcCalendarStamp(new Date())}`,
    `DTSTART:${toUtcCalendarStamp(start)}`,
    `DTEND:${toUtcCalendarStamp(end)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const blob = new Blob([icsLines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(course?.code ?? 'tugas').toLowerCase()}-${task.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
