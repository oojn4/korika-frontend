import React from 'react';
import { Paper, Text, Group, ThemeIcon, Badge } from '@mantine/core';

/**
 * KPICard Component - Displays a key performance indicator in a card format
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Title of the KPI
 * @param {string|number} props.value - Value to display
 * @param {React.ReactNode} props.icon - Icon to display
 * @param {string} props.color - Color theme for the card
 * @param {React.ReactNode} props.footer - Optional footer content
 * @param {string} props.description - Optional description text
 * @returns {React.ReactElement} KPI Card component
 */
const KPICard = ({ 
  title, 
  value, 
  icon, 
  color = 'blue', 
  footer = null,
  description = null 
}: { title: string; value: string | number; icon: React.ReactNode; color: string; footer: React.ReactNode; description: string | null; }): React.ReactElement => {
  return (
    <Paper p="md" radius="md" withBorder>
      <Group mb={5}>
        <Text size="xs" color="dimmed" >
          {title}
        </Text>
        <Badge size="xs" color='blue'mt={4}>
            Data Aktual
        </Badge>
        
        <ThemeIcon
          color={color}
          variant="light"
          size={38}
          radius="md"
        >
          {icon}
        </ThemeIcon>
      </Group>
      
      <Text size="xl">
        {value}
      </Text>
      
      {description && (
        <Text size="xs" color="dimmed" mt={4}>
          {description}
        </Text>
      )}
      
      {footer && (
        <div style={{ marginTop: 10 }}>
          {footer}
        </div>
      )}
    </Paper>
  );
};

export default KPICard;