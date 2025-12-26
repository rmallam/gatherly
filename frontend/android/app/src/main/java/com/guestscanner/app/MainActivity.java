package com.guestscanner.app;

import com.getcapacitor.BridgeActivity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannels();
    }
    
    /**
     * Create notification channels for Android O+ (API 26+)
     * Required for push notifications to work on Android 8.0 and higher
     */
    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            // Create default channel for OneSignal
            NotificationChannel defaultChannel = new NotificationChannel(
                "onesignal_default",
                "General Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            defaultChannel.setDescription("General app notifications");
            defaultChannel.enableVibration(true);
            defaultChannel.setShowBadge(true);
            defaultChannel.enableLights(true);
            
            // Create high priority channel for important notifications
            NotificationChannel highPriorityChannel = new NotificationChannel(
                "OneSignal",
                "Important Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            highPriorityChannel.setDescription("Important app notifications");
            highPriorityChannel.enableVibration(true);
            highPriorityChannel.setShowBadge(true);
            highPriorityChannel.enableLights(true);
            
            // Register channels with the system
            NotificationManager notificationManager = getSystemService(NotificationManager.class);
            if (notificationManager != null) {
                notificationManager.createNotificationChannel(defaultChannel);
                notificationManager.createNotificationChannel(highPriorityChannel);
            }
        }
    }
}
