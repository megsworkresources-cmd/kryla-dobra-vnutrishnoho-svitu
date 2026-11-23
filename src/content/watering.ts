/** The daily check-in follows the child's own local day, never UTC. */
export function localDay(date = new Date()): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** One gentle watering per local day; a missed day never takes growth away. */
export function canWater(wateredOn: string | null | undefined, day = localDay()): boolean {
  return wateredOn !== day;
}
