import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import NotificationCenter from '../NotificationCenter';
import api from '../../services/api';

jest.mock('../../services/api');

const mockNotifications = [
  {
    id: 1,
    title: 'Booking Confirmed',
    message: 'Your booking has been confirmed',
    created_at: '2024-01-01T10:00:00Z'
  }
];

describe('NotificationCenter', () => {
  beforeEach(() => {
    api.get.mockResolvedValue({
      data: {
        notifications: mockNotifications,
        count: 1
      }
    });
  });

  test('renders notification bell with count', async () => {
    render(<NotificationCenter />);
    
    await waitFor(() => {
      expect(screen.getByText('1')).toBeInTheDocument();
    });
  });

  test('opens notification panel when bell is clicked', async () => {
    render(<NotificationCenter />);
    
    const bellButton = screen.getByRole('button');
    fireEvent.click(bellButton);
    
    await waitFor(() => {
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });
  });
});