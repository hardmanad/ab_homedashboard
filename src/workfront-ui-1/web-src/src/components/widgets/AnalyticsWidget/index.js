import React from 'react';
import {
  View,
  Flex,
  Heading,
  Text,
  Well,
  ProgressBar,
  Divider
} from '@adobe/react-spectrum';

const AnalyticsWidget = () => {
  const analyticsData = [
    { label: 'Revenue Growth', value: 85, color: 'positive' },
    { label: 'Customer Satisfaction', value: 92, color: 'positive' },
    { label: 'Project Completion', value: 78, color: 'notice' },
    { label: 'Team Productivity', value: 88, color: 'positive' },
    { label: 'Resource Utilization', value: 65, color: 'negative' }
  ];

  const metrics = [
    { label: 'Total Revenue', value: '$2.4M', change: '+12%', positive: true },
    { label: 'Active Users', value: '1,234', change: '+8%', positive: true },
    { label: 'Conversion Rate', value: '3.2%', change: '-2%', positive: false },
    { label: 'Avg. Session', value: '4m 32s', change: '+15%', positive: true }
  ];

  return (
    <Well>
      <Flex direction="column" gap="size-200">
        <Heading level={3} margin={0}>Analytics Overview</Heading>
        
        {/* Key Metrics */}
        <Flex gap="size-200" wrap>
          {metrics.map((metric, index) => (
            <View key={index} flex="1" minWidth="size-1000">
              <Flex direction="column" gap="size-50">
                <Text size="S" color="text-700">{metric.label}</Text>
                <Text fontWeight="bold" fontSize="size-200">{metric.value}</Text>
                <Text 
                  size="S" 
                  color={metric.positive ? 'positive' : 'negative'}
                >
                  {metric.change}
                </Text>
              </Flex>
            </View>
          ))}
        </Flex>
        
        <Divider />
        
        {/* Progress Bars */}
        <Flex direction="column" gap="size-150">
          {analyticsData.map((item, index) => (
            <View key={index}>
              <Flex justifyContent="space-between" marginBottom="size-50">
                <Text size="S">{item.label}</Text>
                <Text size="S" fontWeight="bold">{item.value}%</Text>
              </Flex>
              <ProgressBar 
                value={item.value} 
                color={item.color}
                size="S"
              />
            </View>
          ))}
        </Flex>
        
        {/* Summary */}
        <View 
          backgroundColor="informative" 
          padding="size-150" 
          borderRadius="medium"
        >
          <Text size="S" color="informative">
            <strong>Summary:</strong> Overall performance is trending positively with 
            3 out of 5 metrics showing improvement this quarter.
          </Text>
        </View>
      </Flex>
    </Well>
  );
};

export default AnalyticsWidget; 