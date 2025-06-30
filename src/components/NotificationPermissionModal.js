import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const NotificationPermissionModal = ({ show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-red-600" />
            Notifications Blocked
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="space-y-4 text-gray-700">
          <p>
            You have previously blocked notifications for this site. To receive reminders, you need to manually re-enable them in your browser settings.
          </p>
          <p className="font-semibold">Here's how (for most browsers):</p>
          <ol className="list-decimal list-inside space-y-2 bg-gray-50 p-4 rounded-lg">
            <li>Click the <span className="font-bold">lock icon (🔒)</span> next to the website address at the top of your browser.</li>
            <li>Find the <span className="font-bold">"Notifications"</span> permission in the dropdown.</li>
            <li>Change the setting from "Block" to <span className="font-bold">"Allow"</span>.</li>
            <li>Reload the page for the changes to take effect.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionModal; 