function main() {

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("Calendar_Events");
    const eventsData = sheet.getDataRange().getValues();
    const eventArray = [];
  
    for (var i = 1; i < eventsData.length; i++) {
      const eventMap = {};
      eventMap['eventName'] = eventsData[i][0];
      eventMap['start'] = eventsData[i][1];
      eventMap['end'] = eventsData[i][2];
      eventMap['description'] = eventsData[i][3];
      eventMap['attendees'] = eventsData[i][4];
      eventMap['optionalAttendees'] = eventsData[i][5];
  
      eventArray.push(eventMap);
    }
  
    Logger.log(JSON.stringify(eventArray, null, 2));
  
    // Call the function
    createNewEvent(eventArray);
  
  }
  
  
  function createNewEvent(eventArray) {
  
    for (i = 0; i < eventArray.length; i++) {
      const event = eventArray[i];
      const calendarEvent = CalendarApp.getDefaultCalendar().createEvent(
        event['eventName'],
        new Date(event['start']),
        new Date(event['end']),
        { sendInvites: true, sendUpdates: "all", guests: event['attendees'] }
      )
  
      // Fetch the event id
      if (event['optionalAttendees']) {
        const eventId = calendarEvent.getId().split('@')[0];
        markAttendeeAsOptional(eventId, event['optionalAttendees']);
      }
    }
  }
  
  
  function markAttendeeAsOptional(eventId, optionalGuestsList, calendarId = 'primary') {
    // Get the event to update
    const event = Calendar.Events.get(calendarId, eventId);
  
    const attendees = event['attendees'];
    const optionalAttendees = []
  
    for (let i = 0; i < attendees.length; i++) {
      const attendee = attendees[i];
      const guest = attendee['email'];
  
      // if guest is there in optional guestLists, then mark that as optional
      if (optionalGuestsList.includes(guest)) {
        attendee['optional'] = true;
      }
  
      optionalAttendees.push(attendee);
    }
  
    // Save the changes to the event
    var resource = { attendees: optionalAttendees };
    Calendar.Events.patch(resource, calendarId, event['id']);
  }