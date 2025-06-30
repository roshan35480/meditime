import React, { useState } from 'react';
import { Users, X, Trash2 } from 'lucide-react';

const UserManagementModal = ({
  show,
  onClose,
  users,
  activeUser,
  onSwitchUser,
  onDeleteUser,
  onCreateUser,
}) => {
  const [newUserName, setNewUserName] = useState('');

  const handleCreateUser = () => {
    if (newUserName.trim()) {
      onCreateUser(newUserName.trim());
      setNewUserName('');
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full m-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            Manage Users
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Create New User */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">Create New User</h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCreateUser()}
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all border-gray-200 hover:border-gray-300"
                placeholder="Enter new user name"
              />
              <button onClick={handleCreateUser} className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold">
                Create
              </button>
            </div>
          </div>

          {/* User List */}
          {users.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">Switch User</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {users.map(user => (
                  <div key={user} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <button
                      onClick={() => onSwitchUser(user)}
                      className={`font-medium ${activeUser === user ? 'text-blue-600' : 'text-gray-800'}`}
                    >
                      {user} {activeUser === user && '(Active)'}
                    </button>
                    <button
                      onClick={() => onDeleteUser(user)}
                      className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-all"
                      title={`Delete user ${user}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagementModal; 