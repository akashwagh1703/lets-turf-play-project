import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, Calendar, Gift, Check, CheckCheck } from 'lucide-react'
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationService'
import { Button } from '../components/ui/Button'
import { Card, CardContent } from '../components/ui/Card'
import { formatDate } from '../lib/utils'

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient()

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: getNotifications
  })

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  const getIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <Calendar className="w-5 h-5 text-accent-600" />
      case 'reminder':
        return <Bell className="w-5 h-5 text-blue-600" />
      case 'promotion':
        return <Gift className="w-5 h-5 text-purple-600" />
      default:
        return <Bell className="w-5 h-5 text-slate-600" />
    }
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id)
    }
    
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="h-8 bg-slate-200 rounded mb-6 w-1/3 animate-pulse" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-slate-200 rounded-full" />
                    <div className="flex-1">
                      <div className="h-4 bg-slate-200 rounded mb-2 w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-slate-600 mt-1">{unreadCount} unread notifications</p>
            )}
          </div>
          
          {unreadCount > 0 && (
            <Button
              onClick={() => markAllAsReadMutation.mutate()}
              variant="outline"
              size="sm"
              isLoading={markAllAsReadMutation.isPending}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No notifications yet</h3>
            <p className="text-slate-600">We'll notify you about bookings, reminders, and special offers</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-slate-100 ${
                  !notification.isRead ? 'border-accent-200 bg-accent-50' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`font-medium ${!notification.isRead ? 'text-slate-900' : 'text-slate-700'}`}>
                          {notification.title}
                        </h3>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-slate-500">
                            {formatDate(new Date(notification.date))}
                          </span>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-accent-600 rounded-full" />
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm mt-1 ${!notification.isRead ? 'text-slate-700' : 'text-slate-600'}`}>
                        {notification.message}
                      </p>
                      
                      {notification.actionUrl && (
                        <span className="text-xs text-accent-600 font-medium mt-2 inline-block">
                          Tap to view details →
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
