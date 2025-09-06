<?php

namespace Tests\Unit;

use App\Models\User;
use App\Models\Notification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_can_be_created()
    {
        $user = User::factory()->create();
        
        $notification = Notification::create([
            'user_id' => $user->id,
            'type' => 'booking_confirmation',
            'title' => 'Test Notification',
            'message' => 'Test message'
        ]);

        $this->assertInstanceOf(Notification::class, $notification);
        $this->assertEquals($user->id, $notification->user_id);
    }

    public function test_notification_can_be_marked_as_read()
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->create(['user_id' => $user->id]);

        $this->assertNull($notification->read_at);
        
        $notification->markAsRead();
        
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_unread_scope_works()
    {
        $user = User::factory()->create();
        
        $unreadNotification = Notification::factory()->create(['user_id' => $user->id]);
        $readNotification = Notification::factory()->create([
            'user_id' => $user->id,
            'read_at' => now()
        ]);

        $unreadCount = Notification::unread()->count();
        
        $this->assertEquals(1, $unreadCount);
    }
}