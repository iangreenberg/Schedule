/**
 * Find the closest timeline day to a given position
 * @param x - The x position to check against
 * @param y - The y position to check against
 * @returns The date of the closest timeline day or the current date if none found
 */
export function findClosestDay(x: number, y: number): Date {
  try {
    // Get all timeline days
    const days = Array.from(document.querySelectorAll('.timeline-day'));
    
    if (days.length === 0) {
      return new Date();
    }
    
    // Get timeline container
    const timeline = document.getElementById('timeline');
    if (!timeline) {
      return new Date();
    }
    
    // Timeline container position
    const timelineRect = timeline.getBoundingClientRect();
    const timelineLeft = timelineRect.left + window.scrollX;
    
    // Find closest day
    let closestDistance = Infinity;
    let closestElement: HTMLElement | null = null;
    
    for (let i = 0; i < days.length; i++) {
      const day = days[i] as HTMLElement;
      const rect = day.getBoundingClientRect();
      
      // Center of the day element
      const dayCenter = rect.left + rect.width / 2 + window.scrollX - timelineLeft + timeline.scrollLeft;
      
      // Calculate distance (horizontal only)
      const distance = Math.abs(dayCenter - x);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestElement = day;
      }
    }
    
    // Get date from data attribute
    if (closestElement) {
      const dateStr = closestElement.getAttribute('data-date');
      if (dateStr) {
        return new Date(dateStr);
      }
    }
  } catch (error) {
    console.error('Error finding closest day:', error);
  }
  
  // Default to current date
  return new Date();
}