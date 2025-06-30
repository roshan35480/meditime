import React from 'react';
import { Clock, Bell, AlertCircle, Settings, Users } from 'lucide-react';

const Header = ({ 
  notificationPermission, 
  onShowPermissionDeniedModal,
  requestNotificationPermission,
  activeUser,
  onShowUserModal
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-xl">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                MediTime
              </h1>
              <p className="hidden sm:block text-xs text-gray-500">Medication Scheduler</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-sm font-medium text-gray-600">
              <span className="hidden sm:inline">User: </span><span className="font-bold text-blue-600">{activeUser || 'None'}</span>
            </div>
            {/* Notification Permission Button */}
            {notificationPermission === 'default' && (
              <button
                onClick={requestNotificationPermission}
                className="flex items-center gap-2 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
              >
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Enable Notifications</span>
              </button>
            )}
            {notificationPermission === 'granted' && (
              <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                <Bell className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications Enabled</span>
              </div>
            )}
            {notificationPermission === 'denied' && (
              <div 
                onClick={onShowPermissionDeniedModal}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-red-200 transition-colors"
              >
                <AlertCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Notifications Blocked</span>
              </div>
            )}
            <button onClick={onShowUserModal} className="p-2 text-gray-400 hover:text-gray-600 transition-colors" title="Manage Users">
              <Users className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header; 