import { addDays, addWeeks, startOfWeek, format, isSameDay } from 'date-fns';

/**
 * Generate an array of dates for a specified range
 */
export function generateDateRange(startDate: Date, daysCount: number): Date[] {
  const dates: Date[] = [];
  const start = new Date(startDate);
  
  for (let i = 0; i < daysCount; i++) {
    dates.push(addDays(start, i));
  }
  
  return dates;
}

/**
 * Generate a range of dates centered on the specified date
 */
export function generateCenteredDateRange(centerDate: Date, daysCount: number): Date[] {
  const halfDays = Math.floor(daysCount / 2);
  const start = addDays(centerDate, -halfDays);
  return generateDateRange(start, daysCount);
}

/**
 * Generate a week view starting from the given date
 */
export function generateWeekDates(date: Date): Date[] {
  const startOfTheWeek = startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
  return generateDateRange(startOfTheWeek, 7);
}

/**
 * Get the next week's dates
 */
export function getNextWeekDates(currentWeekDate: Date): Date[] {
  const nextWeekDate = addWeeks(currentWeekDate, 1);
  return generateWeekDates(nextWeekDate);
}

/**
 * Get the previous week's dates
 */
export function getPreviousWeekDates(currentWeekDate: Date): Date[] {
  const prevWeekDate = addWeeks(currentWeekDate, -1);
  return generateWeekDates(prevWeekDate);
}

/**
 * Format a date as a day of the week
 */
export function formatDayOfWeek(date: Date): string {
  return format(date, 'EEE');
}

/**
 * Format a date for display on the timeline
 */
export function formatTimelineDate(date: Date): string {
  return format(date, 'MMM d');
}

/**
 * Find the closest date element in the timeline to an object's position
 */
export function findClosestDateElement(
  x: number, 
  timelineElements: HTMLElement[]
): HTMLElement | null {
  if (!timelineElements.length) return null;
  
  let closest = timelineElements[0];
  let minDistance = Infinity;
  
  timelineElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const distance = Math.abs(centerX - x);
    
    if (distance < minDistance) {
      minDistance = distance;
      closest = el;
    }
  });
  
  return closest;
}
