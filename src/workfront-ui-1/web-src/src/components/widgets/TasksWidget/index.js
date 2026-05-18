import React from 'react';
import {
  View,
  Flex,
  Heading,
  Text,
  Well,
  Checkbox,
  Button,
  ProgressBar,
  Divider
} from '@adobe/react-spectrum';

const TasksWidget = () => {
  const tasks = [
    {
      id: 1,
      title: 'Review Q4 Marketing Strategy',
      description: 'Finalize the marketing plan for Q4 campaigns',
      priority: 'high',
      dueDate: 'Today',
      completed: false,
      progress: 0
    },
    {
      id: 2,
      title: 'Update Website Content',
      description: 'Refresh homepage and product pages',
      priority: 'medium',
      dueDate: 'Tomorrow',
      completed: false,
      progress: 60
    },
    {
      id: 3,
      title: 'Prepare Board Presentation',
      description: 'Create slides for quarterly board meeting',
      priority: 'high',
      dueDate: 'Dec 15',
      completed: false,
      progress: 30
    },
    {
      id: 4,
      title: 'Team Performance Review',
      description: 'Conduct 1:1 meetings with team members',
      priority: 'medium',
      dueDate: 'Dec 20',
      completed: false,
      progress: 0
    },
    {
      id: 5,
      title: 'Budget Planning 2024',
      description: 'Draft annual budget for next year',
      priority: 'low',
      dueDate: 'Dec 30',
      completed: true,
      progress: 100
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'negative';
      case 'medium': return 'notice';
      case 'low': return 'positive';
      default: return 'text-700';
    }
  };

  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'high': return '🔴 High';
      case 'medium': return '🟡 Medium';
      case 'low': return '🟢 Low';
      default: return priority;
    }
  };

  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;

  return (
    <Well>
      <Flex direction="column" gap="size-200">
        <Flex alignItems="center" justifyContent="space-between">
          <Heading level={3} margin={0}>My Tasks</Heading>
          <Button variant="ghost" size="S">
            Add Task
          </Button>
        </Flex>
        
        {/* Progress Summary */}
        <View 
          backgroundColor="background" 
          padding="size-150" 
          borderRadius="medium"
          borderWidth="thin"
          borderColor="dark"
        >
          <Flex alignItems="center" justifyContent="space-between" marginBottom="size-100">
            <Text size="S">Progress</Text>
            <Text size="S" fontWeight="bold">
              {completedTasks}/{totalTasks} completed
            </Text>
          </Flex>
          <ProgressBar 
            value={(completedTasks / totalTasks) * 100} 
            size="S"
          />
        </View>
        
        {/* Tasks List */}
        <Flex direction="column" gap="size-150">
          {tasks.map((task, index) => (
            <View key={task.id}>
              <Flex gap="size-150" alignItems="flex-start">
                <Checkbox 
                  isSelected={task.completed}
                  onChange={() => {}}
                />
                
                <Flex direction="column" flex="1" gap="size-50">
                  <Flex alignItems="center" gap="size-100">
                    <Text 
                      fontWeight="bold" 
                      textDecoration={task.completed ? 'line-through' : 'none'}
                      color={task.completed ? 'text-600' : 'text-900'}
                    >
                      {task.title}
                    </Text>
                    <Text 
                      size="S" 
                      color={getPriorityColor(task.priority)}
                    >
                      {getPriorityLabel(task.priority)}
                    </Text>
                  </Flex>
                  
                  <Text size="S" color="text-600">
                    {task.description}
                  </Text>
                  
                  <Flex alignItems="center" justifyContent="space-between">
                    <Text size="S" color="text-500">Due: {task.dueDate}</Text>
                    {!task.completed && task.progress > 0 && (
                      <Text size="S" color="text-500">{task.progress}% done</Text>
                    )}
                  </Flex>
                  
                  {!task.completed && task.progress > 0 && (
                    <ProgressBar 
                      value={task.progress} 
                      size="S"
                      marginTop="size-50"
                    />
                  )}
                </Flex>
              </Flex>
              
              {index < tasks.length - 1 && (
                <Divider marginTop="size-150" />
              )}
            </View>
          ))}
        </Flex>
        
        <Button variant="secondary" width="100%">
          View All Tasks
        </Button>
      </Flex>
    </Well>
  );
};

export default TasksWidget; 