// utils/date.js
// Small date helpers. Week starts on Monday (matches the prototype: MON..SUN).

export const LOCALIZED_DATES = {
  English: {
    WEEKDAYS: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    MONTHS: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ]
  },
  Türkçe: {
    WEEKDAYS: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
    MONTHS: [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
    ]
  }
};

export const toISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const sameDay = (a, b) => toISO(a) === toISO(b);

// Monday-based weekday index (0 = Monday ... 6 = Sunday)
export const mondayIndex = (jsDay) => (jsDay + 6) % 7;

// Returns an array of weeks; each week is an array of 7 cells.
// A cell is either { date: Date, inMonth: bool } or null padding.
export function getMonthMatrix(year, month) {
  const first = new Date(year, month, 1);
  const startPad = mondayIndex(first.getDay());
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

// The Monday->Sunday cells for the week containing `date`.
// Same cell shape as getMonthMatrix ({ date, inMonth }) so callers can render
// week and month layouts with one code path.
export function getWeekDates(date) {
  const start = new Date(date);
  start.setDate(date.getDate() - mondayIndex(date.getDay()));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return { date: d, inMonth: d.getMonth() === date.getMonth() };
  });
}

// FORMAT FONKSİYONLARI: Artık "lang" (dil) parametresi alıyor
export const formatLong = (d, lang = 'English') => {
  const month = LOCALIZED_DATES[lang].MONTHS[d.getMonth()];
  if (lang === 'Türkçe') {
    return `${d.getDate()} ${month} ${d.getFullYear()}`; // Örn: 20 Haziran 2026
  }
  return `${month} ${d.getDate()}, ${d.getFullYear()}`; // Örn: June 20, 2026
};

export const formatShort = (d, lang = 'English') => {
  const monthShort = LOCALIZED_DATES[lang].MONTHS[d.getMonth()].slice(0, 3);
  if (lang === 'Türkçe') {
    return `${d.getDate()} ${monthShort}`; // Örn: 20 Haz
  }
  return `${monthShort} ${d.getDate()}`; // Örn: Jun 20
};