import React from 'react';
import {
  View,
  Flex,
  Heading,
  Text,
  Well,
  Button,
  Divider
} from '@adobe/react-spectrum';

const CalendarWidget = () => {
  const events = [
    {
      id: 1,
      title: 'Team Standup',
      time: '9:00 AM - 9:30 AM',
      attendees: ['John', 'Sarah', 'Mike', 'Lisa'],
      type: 'meeting',
      today: true
    },
    {
      id: 2,
      title: 'Client Presentation',
      time: '2:00 PM - 3:00 PM',
      attendees: ['John', 'David', 'Emma'],
      type: 'presentation',
      today: true
    },
    {
      id: 3,
      title: 'Project Review',
      time: '10:00 AM - 11:00 AM',
      attendees: ['John', 'Alex'],
      type: 'review',
      today: false
    },
    {
      id: 4,
      title: 'Budget Meeting',
      time: '3:30 PM - 4:30 PM',
      attendees: ['John', 'Sarah', 'Mike', 'David', 'Emma'],
      type: 'meeting',
      today: false
    }
  ];

  const getEventColor = (type) => {
    switch (type) {
      case 'meeting': return 'informative';
      case 'presentation': return 'notice';
      case 'review': return 'positive';
      default: return 'text-700';
    }
  };

  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentYear = today.getFullYear();

  return (
    <Well>
      <Flex direction="column" gap="size-200">
        <Flex alignItems="center" justifyContent="space-between">
          <Heading level={3} margin={0}>Calendar</Heading>
          <Button variant="ghost" size="S">
            Add Event
          </Button>
        </Flex>
        
        {/* Calendar Header */}
        <View 
          backgroundColor="background" 
          padding="size-150" 
          borderRadius="medium"
          borderWidth="thin"
          borderColor="dark"
        >
          <Flex alignItems="center" justifyContent="space-between">
            <Button variant="ghost" size="S">
              ←
            </Button>
            <Text fontWeight="bold">
              {currentMonth} {currentYear}
            </Text>
            <Button variant="ghost" size="S">
              →
            </Button>
          </Flex>
        </View>
        
        {/* Today's Events */}
        <View>
          <Text fontWeight="bold" marginBottom="size-150">Today's Events</Text>
          <Flex direction="column" gap="size-150">
            {events.filter(event => event.today).map((event, index) => (
              <View key={event.id}>
                <Flex gap="size-150" alignItems="flex-start">
                  <View 
                    backgroundColor={getEventColor(event.type)}
                    width="size-100"
                    height="size-100"
                    borderRadius="medium"
                    flexShrink={0}
                  />
                  
                  <Flex direction="column" flex="1" gap="size-50">
                    <Text fontWeight="bold">{event.title}</Text>
                    <Flex alignItems="center" gap="size-100">
                      <Text size="S" color="text-600">🕐 {event.time}</Text>
                    </Flex>
                    <Flex alignItems="center" gap="size-100">
                      <Text size="S" color="text-600">
                        👥 {event.attendees.length} attendees
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
                
                {index < events.filter(e => e.today).length - 1 && (
                  <Divider marginTop="size-150" />
                )}
              </View>
            ))}
          </Flex>
        </View>
        
        {/* Upcoming Events */}
        <View>
          <Text fontWeight="bold" marginBottom="size-150">Upcoming</Text>
          <Flex direction="column" gap="size-150">
            {events.filter(event => !event.today).slice(0, 3).map((event, index) => (
              <View key={event.id}>
                <Flex gap="size-150" alignItems="flex-start">
                  <View 
                    backgroundColor={getEventColor(event.type)}
                    width="size-100"
                    height="size-100"
                    borderRadius="medium"
                    flexShrink={0}
                  />
                  
                  <Flex direction="column" flex="1" gap="size-50">
                    <Text fontWeight="bold">{event.title}</Text>
                    <Flex alignItems="center" gap="size-100">
                      <Text size="S" color="text-600">📅 {event.time}</Text>
                    </Flex>
                    <Flex alignItems="center" gap="size-100">
                      <Text size="S" color="text-600">
                        👥 {event.attendees.length} attendees
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>
                
                {index < Math.min(3, events.filter(e => !e.today).length) - 1 && (
                  <Divider marginTop="size-150" />
                )}
              </View>
            ))}
          </Flex>
        </View>
        
        <Button variant="secondary" width="100%">
          View Full Calendar
        </Button>
      </Flex>
    </Well>
  );
};

export default CalendarWidget; 