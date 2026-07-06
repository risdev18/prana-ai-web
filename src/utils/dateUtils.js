export const addMonthsSafe = (dateInput, months) => {
  const d = new Date(dateInput);
  const currentMonth = d.getMonth();
  const monthsToAdd = parseInt(months, 10);
  
  d.setMonth(currentMonth + monthsToAdd);
  
  const expectedMonth = (currentMonth + monthsToAdd) % 12;
  const expectedMonthNormalized = expectedMonth < 0 ? expectedMonth + 12 : expectedMonth;
  
  if (d.getMonth() !== expectedMonthNormalized) {
    d.setDate(0); // Sets to last day of previous month to fix overflow
  }
  
  // Format as YYYY-MM-DD local
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

export const getNextDay = (dateInput) => {
  const d = new Date(dateInput);
  d.setDate(d.getDate() + 1);
  
  // Format as YYYY-MM-DD local
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
