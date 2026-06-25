export const addEventToCalendar = async (accessToken: string, summary: string, description: string, durationHours: number) => {
  const startTime = new Date();
  // Start 15 minutes from now
  startTime.setMinutes(startTime.getMinutes() + 15);
  
  const endTime = new Date(startTime.getTime() + durationHours * 60 * 60 * 1000);

  const event = {
    summary,
    description,
    start: {
      dateTime: startTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    end: {
      dateTime: endTime.toISOString(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error?.message || 'Failed to add event to calendar');
  }

  return response.json();
};
