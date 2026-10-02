/**
 * Regional Settings & Localization Formatter for Indonesia (IDR / id-ID)
 * - Currency: Indonesian Rupiah (Rp)
 * - Timestamp format: dd mmm yyyy hh:mm
 * - Date format: dd mmm yyyy
 * - Time format: hh:mm
 * - Decimal separator: , (comma)
 * - Thousand separator: . (dot)
 */

export const USD_TO_IDR_EXCHANGE_RATE = 16000;

// Standard Indonesian 3-letter month abbreviations
const MONTH_ABBR = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

/**
 * Parse any number safely, whether string or numeric, handling both Indonesian (1.234,56)
 * and English (1,234.56) thousand and decimal separators.
 */
export function parseNumberSafe(value: number | string | null | undefined): number {
  if (value === null || value === undefined) return NaN;
  if (typeof value === 'number') return value;
  let str = String(value).trim();
  if (!str) return NaN;

  const hasComma = str.includes(',');
  const hasDot = str.includes('.');

  if (hasComma && hasDot) {
    if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
      // Indonesian format: 1.234.567,89 -> dots are thousands, comma is decimal
      str = str.replace(/\./g, '').replace(',', '.');
    } else {
      // English format: 1,234,567.89 -> commas are thousands, dot is decimal
      str = str.replace(/,/g, '');
    }
  } else if (hasComma) {
    // Check if multiple commas: 69,150,207 -> thousands
    const commaCount = (str.match(/,/g) || []).length;
    if (commaCount > 1) {
      str = str.replace(/,/g, '');
    } else {
      // Single comma
      const parts = str.split(',');
      if (parts[1].length === 3 && parts[0].length >= 1 && parts[0].length <= 3) {
        // e.g. '2,661', '7,887', '4,934' -> standard English thousand separator from CSV
        str = str.replace(/,/g, '');
      } else {
        // e.g. '138,4', '98,64', '10,99', '12,5' -> comma decimal
        str = str.replace(',', '.');
      }
    }
  } else if (hasDot) {
    // Only dots
    const dotCount = (str.match(/\./g) || []).length;
    if (dotCount > 1) {
      // Multiple dots: 1.234.567 -> thousands
      str = str.replace(/\./g, '');
    } else {
      // Single dot: e.g. '138.4', '8811.67', '2.4'
      // Leave as standard JS float
    }
  }

  const num = Number(str);
  return isNaN(num) ? NaN : num;
}

/**
 * Format a number with Indonesian separators:
 * Dot (.) for thousands and Comma (,) for decimals
 * e.g. 1940323 -> "1.940.323"
 * e.g. 138.4 -> "138,4" or "138,40"
 */
export function formatNumberID(
  value: number | string | null | undefined, 
  decimals?: number
): string {
  const num = parseNumberSafe(value);
  if (isNaN(num)) {
    return '0';
  }

  const fixedDecimals = decimals !== undefined ? decimals : (num % 1 !== 0 ? 2 : 0);
  
  const parts = Math.abs(num).toFixed(fixedDecimals).split('.');
  const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const decPart = parts[1];

  const sign = num < 0 ? '-' : '';
  if (decPart !== undefined && fixedDecimals > 0) {
    return `${sign}${intPart},${decPart}`;
  }
  return `${sign}${intPart}`;
}

/**
 * Format currency in Indonesian Rupiah (Rp)
 * @param value Amount (assumed in USD by default if converting from base risk engine, or direct IDR if isDirectIDR: true)
 * @param options options for conversion, abbreviation, and precision
 */
export function formatCurrencyIDR(
  value: number | null | undefined,
  options: {
    isDirectIDR?: boolean;
    compact?: boolean;
    showSymbol?: boolean;
    decimals?: number;
  } = {}
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return options.showSymbol !== false ? 'Rp 0' : '0';
  }

  const {
    isDirectIDR = false,
    compact = false,
    showSymbol = true,
    decimals
  } = options;

  // Convert to IDR if input is USD
  const idrValue = isDirectIDR ? Number(value) : Number(value) * USD_TO_IDR_EXCHANGE_RATE;
  const symbol = showSymbol ? 'Rp ' : '';

  if (compact) {
    const absVal = Math.abs(idrValue);
    const sign = idrValue < 0 ? '-' : '';

    if (absVal >= 1_000_000_000_000) {
      // Triliun (T)
      const triliun = absVal / 1_000_000_000_000;
      const dec = decimals !== undefined ? decimals : 2;
      return `${symbol}${sign}${formatNumberID(triliun, dec)} Triliun`;
    } else if (absVal >= 1_000_000_000) {
      // Miliar (M)
      const miliar = absVal / 1_000_000_000;
      const dec = decimals !== undefined ? decimals : 2;
      return `${symbol}${sign}${formatNumberID(miliar, dec)} Miliar`;
    } else if (absVal >= 1_000_000) {
      // Juta (Jt)
      const juta = absVal / 1_000_000;
      const dec = decimals !== undefined ? decimals : 2;
      return `${symbol}${sign}${formatNumberID(juta, dec)} Juta`;
    } else if (absVal >= 1_000) {
      // Ribu (Rb)
      const ribu = absVal / 1_000;
      const dec = decimals !== undefined ? decimals : 0;
      return `${symbol}${sign}${formatNumberID(ribu, dec)} Ribu`;
    }
  }

  // Full format with dot thousand separator and comma decimal separator
  const dec = decimals !== undefined ? decimals : 0;
  return `${symbol}${formatNumberID(idrValue, dec)}`;
}

// Comprehensive Indonesian and English month mapping
const MONTH_MAP: Record<string, number> = {
  jan: 0, januari: 0, january: 0,
  feb: 1, februari: 1, february: 1, peb: 1, pebruari: 1,
  mar: 2, maret: 2, march: 2,
  apr: 3, april: 3,
  mei: 4, may: 4,
  jun: 5, juni: 5, june: 5,
  jul: 6, juli: 6, july: 6,
  agu: 7, ags: 7, agt: 7, aug: 7, agustus: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  okt: 9, oct: 9, oktober: 9, october: 9,
  nov: 10, nop: 10, nopember: 10, november: 10,
  des: 11, dec: 11, desember: 11, december: 11
};

/**
 * Helper to parse any incoming date/timestamp string, number, or Excel serial into a JS Date object safely.
 * Handles Excel serial numbers, ISO strings, DD/MM/YYYY, DD-MM-YYYY, DD MMM YYYY, 2-digit years,
 * dot-separated time (e.g. 08.22), AM/PM markers, and Indonesian month names.
 */
export function parseDateSafe(input: string | Date | number | null | undefined): Date | null {
  if (input === null || input === undefined || input === '') return null;
  
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null;
    // Round to nearest minute to eliminate Excel floating-point second fractions (e.g. 59.999s)
    const roundedMs = Math.round(input.getTime() / 60000) * 60000;
    return new Date(roundedMs);
  }

  // 1. Handle number (Excel serial date vs UNIX timestamp)
  if (typeof input === 'number') {
    if (isNaN(input)) return null;
    // Excel serial dates typically range from ~20000 (1954) to ~90000 (2146)
    if (input > 20000 && input < 90000) {
      const wholeDays = Math.floor(input);
      const dayFraction = input - wholeDays;
      const totalSeconds = Math.round(dayFraction * 86400);
      let hours = Math.floor(totalSeconds / 3600);
      let minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (seconds >= 30) minutes += 1;
      if (minutes >= 60) { minutes = 0; hours += 1; }

      // Excel epoch begins Dec 30 1899
      const baseDate = new Date(Date.UTC(1899, 11, 30));
      baseDate.setUTCDate(baseDate.getUTCDate() + wholeDays);
      return new Date(baseDate.getUTCFullYear(), baseDate.getUTCMonth(), baseDate.getUTCDate(), hours, minutes);
    }
    // Unix epoch seconds
    if (input > 0 && input < 10000000000) {
      return new Date(input * 1000);
    }
    // Unix epoch milliseconds
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(input).trim();
  if (!str) return null;

  // 2. Numeric Excel serial string (e.g. "45672.34861")
  if (/^\d{5}(?:\.\d+)?$/.test(str)) {
    return parseDateSafe(parseFloat(str));
  }

  // 3. ISO or YYYY-MM-DD or YYYY/MM/DD (e.g. "2023-01-16 08:22:00", "2023-01-16T08:22:00Z")
  const ymdMatch = str.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:[\sT]+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?(?:\s*(am|pm))?)?/i);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    let hour = ymdMatch[4] !== undefined ? parseInt(ymdMatch[4], 10) : 0;
    const min = ymdMatch[5] !== undefined ? parseInt(ymdMatch[5], 10) : 0;
    const ampm = ymdMatch[7]?.toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;
    const parsed = new Date(year, month, day, hour, min);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // 4. Text Month: DD MMM YYYY or DD-MMM-YY (e.g. "16 Jan 2023 08:22", "16-Jan-23 08.22", "16 Januari 2025")
  const textMonthMatch = str.match(/^(\d{1,2})[\s\.\-]+([a-zA-Z]{3,9})[\s\.\-]+(\d{2,4})(?:[\sT]+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?(?:\s*(am|pm))?)?/i);
  if (textMonthMatch) {
    const day = parseInt(textMonthMatch[1], 10);
    const mStr = textMonthMatch[2].toLowerCase();
    let year = parseInt(textMonthMatch[3], 10);
    if (year < 100) year += year < 50 ? 2000 : 1900;
    let hour = textMonthMatch[4] !== undefined ? parseInt(textMonthMatch[4], 10) : 0;
    const min = textMonthMatch[5] !== undefined ? parseInt(textMonthMatch[5], 10) : 0;
    const ampm = textMonthMatch[7]?.toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    const mIdx = MONTH_MAP[mStr] !== undefined ? MONTH_MAP[mStr] : MONTH_MAP[mStr.slice(0, 3)];
    if (mIdx !== undefined) {
      const parsed = new Date(year, mIdx, day, hour, min);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  // 5. Month-First Text: MMM DD, YYYY (e.g. "Jan 16, 2023 08:22", "January 16, 2025")
  const monthFirstMatch = str.match(/^([a-zA-Z]{3,9})[\s\.\-]+(\d{1,2}),?[\s\.\-]+(\d{2,4})(?:[\sT]+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?(?:\s*(am|pm))?)?/i);
  if (monthFirstMatch) {
    const mStr = monthFirstMatch[1].toLowerCase();
    const day = parseInt(monthFirstMatch[2], 10);
    let year = parseInt(monthFirstMatch[3], 10);
    if (year < 100) year += year < 50 ? 2000 : 1900;
    let hour = monthFirstMatch[4] !== undefined ? parseInt(monthFirstMatch[4], 10) : 0;
    const min = monthFirstMatch[5] !== undefined ? parseInt(monthFirstMatch[5], 10) : 0;
    const ampm = monthFirstMatch[7]?.toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    const mIdx = MONTH_MAP[mStr] !== undefined ? MONTH_MAP[mStr] : MONTH_MAP[mStr.slice(0, 3)];
    if (mIdx !== undefined) {
      const parsed = new Date(year, mIdx, day, hour, min);
      if (!isNaN(parsed.getTime())) return parsed;
    }
  }

  // 6. Numeric date: DD/MM/YYYY, DD-MM-YYYY, DD.MM.YYYY or MM/DD/YYYY (e.g. "16/01/2023 08.22", "16/01/23 08:22")
  const numericMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})(?:[\sT]+(\d{1,2})[:.](\d{2})(?:[:.](\d{2}))?(?:\s*(am|pm))?)?/i);
  if (numericMatch) {
    const p1 = parseInt(numericMatch[1], 10);
    const p2 = parseInt(numericMatch[2], 10);
    let year = parseInt(numericMatch[3], 10);
    if (year < 100) year += year < 50 ? 2000 : 1900;
    let hour = numericMatch[4] !== undefined ? parseInt(numericMatch[4], 10) : 0;
    const min = numericMatch[5] !== undefined ? parseInt(numericMatch[5], 10) : 0;
    const ampm = numericMatch[7]?.toLowerCase();
    if (ampm === 'pm' && hour < 12) hour += 12;
    if (ampm === 'am' && hour === 12) hour = 0;

    let day: number;
    let month: number;
    if (p1 > 12) {
      // Definitely DD/MM
      day = p1;
      month = p2 - 1;
    } else if (p2 > 12) {
      // Definitely MM/DD
      day = p2;
      month = p1 - 1;
    } else {
      // Default to Indonesian standard DD/MM
      day = p1;
      month = p2 - 1;
    }

    const parsed = new Date(year, month, day, hour, min);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // 7. Month-Year: 'Jan-23', 'Jan-2023', 'Jan 23', 'Januari 2023' (prevents new Date('Jan-23') yielding year 2001)
  const monthYearOnlyMatch = str.match(/^([a-zA-Z]{3,9})[\s\.\-\/]+(\d{2,4})$/i);
  if (monthYearOnlyMatch) {
    const rawMonth = monthYearOnlyMatch[1].toLowerCase();
    let year = parseInt(monthYearOnlyMatch[2], 10);
    if (year < 100) year += (year < 50 ? 2000 : 1900);
    const mIdx = MONTH_MAP[rawMonth] !== undefined ? MONTH_MAP[rawMonth] : MONTH_MAP[rawMonth.slice(0, 3)];
    if (mIdx !== undefined) {
      return new Date(year, mIdx, 1);
    }
  }

  // 8. Year-Month numeric: '2023-01', '2023/01', '2023.01'
  const yearMonthNumericMatch = str.match(/^(\d{4})[\s\.\-\/]+(0?[1-9]|1[0-2])$/);
  if (yearMonthNumericMatch) {
    const year = parseInt(yearMonthNumericMatch[1], 10);
    const month = parseInt(yearMonthNumericMatch[2], 10) - 1;
    return new Date(year, month, 1);
  }

  // 9. Month-Year numeric: '01/2023', '01-2023', '1/2023'
  const monthYearNumericMatch = str.match(/^(0?[1-9]|1[0-2])[\s\.\-\/]+(\d{4})$/);
  if (monthYearNumericMatch) {
    const month = parseInt(monthYearNumericMatch[1], 10) - 1;
    const year = parseInt(monthYearNumericMatch[2], 10);
    return new Date(year, month, 1);
  }

  // 10. Fallback to standard Date parsing (reject numbers < 1950 like 744, 696, 720)
  if (/^\d{1,4}$/.test(str)) {
    const num = parseInt(str, 10);
    if (num < 1950) return null;
  }
  const stdDate = new Date(str);
  if (!isNaN(stdDate.getTime())) {
    if (stdDate.getFullYear() < 1950 || stdDate.getFullYear() > 2100) return null;
    return stdDate;
  }

  return null;
}

/**
 * Format to Date: "dd mmm yyyy"
 * e.g. "16 Jan 2025", "05 Mar 2026"
 */
export function formatDateID(input: string | Date | number | null | undefined): string {
  const d = parseDateSafe(input);
  if (!d) {
    // If string already matches "dd mmm yyyy", return directly
    if (typeof input === 'string' && /^\d{2}\s+[A-Za-z]{3}\s+\d{4}$/.test(input.trim())) {
      return input.trim();
    }
    return String(input || '-');
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_ABBR[d.getMonth()] || 'Jan';
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Format to Time: "hh:mm"
 * e.g. "08:22", "14:30"
 */
export function formatTimeID(input: string | Date | number | null | undefined): string {
  const d = parseDateSafe(input);
  if (!d) {
    if (typeof input === 'string') {
      const match = input.match(/\b(\d{2}:\d{2})\b/);
      if (match) return match[1];
    }
    return '00:00';
  }

  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${hours}:${minutes}`;
}

/**
 * Format to Timestamp: "dd mmm yyyy hh:mm"
 * e.g. "16 Jan 2025 08:22"
 */
export function formatTimestampID(input: string | Date | number | null | undefined): string {
  const d = parseDateSafe(input);
  if (!d) {
    // If string already has format "dd mmm yyyy hh:mm", normalize and return
    if (typeof input === 'string' && /^\d{2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}$/.test(input.trim())) {
      return input.trim();
    }
    return String(input || '-');
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_ABBR[d.getMonth()] || 'Jan';
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return `${day} ${month} ${year} ${hours}:${minutes}`;
}

/**
 * Format Plant Duration hours with comma decimal separator:
 * e.g. 138.4 -> "138,4 jam"
 */
export function formatHoursID(hours: number | null | undefined): string {
  if (hours === null || hours === undefined || isNaN(Number(hours))) return '0 jam';
  return `${formatNumberID(hours, 1)} jam`;
}

/**
 * Format Megawatt Hours (MWh) with dot thousand separator:
 * e.g. 13840 -> "13.840 MWh"
 */
export function formatMWhID(mwh: number | null | undefined): string {
  if (mwh === null || mwh === undefined || isNaN(Number(mwh))) return '0 MWh';
  return `${formatNumberID(mwh, 0)} MWh`;
}

/**
 * Format Month-Year strings (e.g. "Jan-23" -> "Jan 2023", Date object -> "Jan 2023") according to Indonesian month names ("mmm yyyy")
 */
export function formatMonthYearID(input: string | Date | number | null | undefined): string {
  if (input === null || input === undefined || input === '') return '-';

  if (input instanceof Date && !isNaN(input.getTime())) {
    const month = MONTH_ABBR[input.getMonth()] || 'Jan';
    const year = input.getFullYear();
    return `${month} ${year}`;
  }

  // If numeric input:
  // Numbers like 744, 696, 720 are period hours or metrics, NOT month-year dates!
  if (typeof input === 'number') {
    if (input > 20000 && input < 90000) {
      const wholeDays = Math.floor(input);
      const baseDate = new Date(Date.UTC(1899, 11, 30));
      baseDate.setUTCDate(baseDate.getUTCDate() + wholeDays);
      const month = MONTH_ABBR[baseDate.getUTCMonth()] || 'Jan';
      const year = baseDate.getUTCFullYear();
      return `${month} ${year}`;
    }
    return String(input);
  }

  const str = String(input).trim();
  if (!str) return '-';

  // If string is purely 1 to 4 digits (e.g. "744", "696", "720", "24", "0")
  if (/^\d{1,4}$/.test(str)) {
    const num = parseInt(str, 10);
    if (num < 1950 || num > 2099) {
      return str;
    }
  }

  // 1. Text Month + Year: 'Jan-23', 'Jan-2023', 'Jan 23', 'Jan 2023', 'Januari 2023', 'Maret-24', 'Des-25'
  const textMonthMatch = str.match(/^([a-zA-Z]{3,9})[\s\.\-\/]+(\d{2,4})$/i);
  if (textMonthMatch) {
    const rawMonth = textMonthMatch[1].toLowerCase();
    let year = parseInt(textMonthMatch[2], 10);
    if (year < 100) year += (year < 50 ? 2000 : 1900);
    const mIdx = MONTH_MAP[rawMonth] !== undefined ? MONTH_MAP[rawMonth] : MONTH_MAP[rawMonth.slice(0, 3)];
    if (mIdx !== undefined) {
      return `${MONTH_ABBR[mIdx]} ${year}`;
    }
  }

  // 2. Year + Text Month: '2023-Jan', '2023 Jan', '2023/Jan', '2023-Januari', '23-Jan'
  const yearTextMonthMatch = str.match(/^(\d{2,4})[\s\.\-\/]+([a-zA-Z]{3,9})$/i);
  if (yearTextMonthMatch) {
    let year = parseInt(yearTextMonthMatch[1], 10);
    if (year < 100) year += (year < 50 ? 2000 : 1900);
    const rawMonth = yearTextMonthMatch[2].toLowerCase();
    const mIdx = MONTH_MAP[rawMonth] !== undefined ? MONTH_MAP[rawMonth] : MONTH_MAP[rawMonth.slice(0, 3)];
    if (mIdx !== undefined) {
      return `${MONTH_ABBR[mIdx]} ${year}`;
    }
  }

  // 3. Numeric Year-Month: '2023-01', '2023/01', '2023.01', '2023 01'
  const ymMatch = str.match(/^(\d{4})[\s\.\-\/]+(0?[1-9]|1[0-2])$/);
  if (ymMatch) {
    const year = parseInt(ymMatch[1], 10);
    const mIdx = parseInt(ymMatch[2], 10) - 1;
    return `${MONTH_ABBR[mIdx]} ${year}`;
  }

  // 4. Numeric Month-Year (4-digit year): '01/2023', '01-2023', '1/2023', '01.2023'
  const myMatch = str.match(/^(0?[1-9]|1[0-2])[\s\.\-\/]+(\d{4})$/);
  if (myMatch) {
    const mIdx = parseInt(myMatch[1], 10) - 1;
    const year = parseInt(myMatch[2], 10);
    return `${MONTH_ABBR[mIdx]} ${year}`;
  }

  // 5. Numeric Month-Year (2-digit year): '01/23', '01-23', '1/23'
  const my2Match = str.match(/^(0?[1-9]|1[0-2])[\s\.\-\/]+(\d{2})$/);
  if (my2Match) {
    const mIdx = parseInt(my2Match[1], 10) - 1;
    let year = parseInt(my2Match[2], 10);
    year += (year < 50 ? 2000 : 1900);
    return `${MONTH_ABBR[mIdx]} ${year}`;
  }

  // 6. Compact YYYYMM: '202301', '202412'
  const yyyymmMatch = str.match(/^(\d{4})(0[1-9]|1[0-2])$/);
  if (yyyymmMatch) {
    const year = parseInt(yyyymmMatch[1], 10);
    const mIdx = parseInt(yyyymmMatch[2], 10) - 1;
    return `${MONTH_ABBR[mIdx]} ${year}`;
  }

  // 7. Full Date parsing fallback (e.g. '2023-01-31', '31/01/2023', '31 Jan 2023', etc.)
  const d = parseDateSafe(input);
  if (d) {
    const month = MONTH_ABBR[d.getMonth()] || 'Jan';
    const year = d.getFullYear();
    return `${month} ${year}`;
  }

  return str;
}

