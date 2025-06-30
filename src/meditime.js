import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock, Bell, AlertCircle } from 'lucide-react';
import UserManagementModal from './components/UserManagementModal';
import NotificationPermissionModal from './components/NotificationPermissionModal';
import Header from './components/Header';
import ScheduleForm from './components/ScheduleForm';
import SchedulePreview from './components/SchedulePreview';
import Overview from './components/Overview';
import { v4 as uuidv4 } from 'uuid';

const LOCAL_STORAGE_KEY = 'meditime_app_data';

// Define initial state for a single medicine
const initialMedicineState = {
  medicineName: '',
  schedulingMethod: '', // 'daysPerWeek' or 'daysGap'
  selectedDays: [],
  daysGap: '',
  timesPerDay: '',
  doseTimes: [''],
  startDate: '',
  endDate: ''
};

const MediTime = () => {
  const [formData, setFormData] = useState({
    patientName: '',
    medicines: [{ ...initialMedicineState }]
  });

  const [submittedData, setSubmittedData] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('schedule');
  
  // Multi-user state
  const [activeUser, setActiveUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [savedSchedules, setSavedSchedules] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);

  // New state for the permission denied modal
  const [showPermissionDeniedModal, setShowPermissionDeniedModal] = useState(false);

  const [reminder, setReminder] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const reminderTimeoutRef = useRef(null);
  const audioRef = useRef(null);

  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Create audio element for reminder sound
  useEffect(() => {
    audioRef.current = new Audio();
    // Create a simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  // Load data from localStorage on mount
  useEffect(() => {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (data) {
      const appData = JSON.parse(data);
      const users = appData.users || [];
      setAllUsers(users);
      
      const lastUser = appData.lastActiveUser;
      if (lastUser && users.includes(lastUser)) {
        setActiveUser(lastUser);
        setSavedSchedules(appData.schedules[lastUser] || []);
      } else if (users.length > 0) {
        setActiveUser(users[0]);
        setSavedSchedules(appData.schedules[users[0]] || []);
      }
    }
  }, []);

  // Save to localStorage whenever users or schedules change
  useEffect(() => {
    if (allUsers.length > 0) {
      const schedulesForUsers = allUsers.reduce((acc, user) => {
        acc[user] = user === activeUser ? savedSchedules : (JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY))?.schedules?.[user] || []);
        return acc;
      }, {});

      const appData = {
        users: allUsers,
        schedules: schedulesForUsers,
        lastActiveUser: activeUser
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(appData));
    } else {
       localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [allUsers, savedSchedules, activeUser]);

  // Effect to update displayed schedules when active user changes
  useEffect(() => {
    if (activeUser) {
      const data = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (data) {
        const appData = JSON.parse(data);
        setSavedSchedules(appData.schedules[activeUser] || []);
      }
    } else {
      setSavedSchedules([]);
    }
    // Reset form when user changes to avoid data leakage between profiles
    resetForm();
  }, [activeUser]);

  // Save a new schedule to the active user's list
  useEffect(() => {
    if (submittedData && activeUser) {
      const updatedSchedules = [...savedSchedules, submittedData];
      setSavedSchedules(updatedSchedules);
    }
  }, [submittedData]);

  // Function to play reminder sound
  const playReminderSound = () => {
    try {
      // Try to play a simple beep sound
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  // Function to show browser notification
  const showBrowserNotification = (title, body) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico', // Use your app's favicon
        badge: '/favicon.ico',
        tag: 'meditime-reminder',
        requireInteraction: true, // Keep notification until user interacts
        silent: false // Allow system sound
      });

      // Handle notification click
      notification.onclick = function() {
        window.focus();
        notification.close();
      };

      // Auto-close after 30 seconds
      setTimeout(() => {
        notification.close();
      }, 30000);
    }
  };

  // Medicine reminder logic for the active user's schedules
  useEffect(() => {
    if (!activeUser || savedSchedules.length === 0) return;

    if (reminderTimeoutRef.current) {
      clearTimeout(reminderTimeoutRef.current);
    }

    let soonestDose = null;
    let reminderPatient = null;
    let reminderMedicine = null;

    const now = new Date();
    const today = now.toISOString().slice(0, 10);

    savedSchedules.forEach(schedule => {
      schedule.medicines.forEach(medicine => {
        const times = (medicine.doseTimes || []).filter(Boolean);
        times.forEach(time => {
          const [h, m] = time.split(':');
          if (h && m) {
            const doseDate = new Date(`${today}T${time}:00`);
            if (doseDate > now && (!soonestDose || doseDate < soonestDose)) {
              soonestDose = doseDate;
              reminderPatient = schedule.patientName;
              reminderMedicine = medicine;
            }
          }
        });
      });
    });

    if (soonestDose && reminderMedicine) {
      const ms = soonestDose - now;
      reminderTimeoutRef.current = setTimeout(() => {
        const reminderMessage = `⏰ MEDICATION REMINDER: ${reminderPatient} - Take ${reminderMedicine.medicineName} now (${soonestDose.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;
        
        setReminder(reminderMessage);
        playReminderSound();
        showBrowserNotification(
          'MediTime - Medication Reminder',
          `${reminderPatient}: Take ${reminderMedicine.medicineName} now`
        );
      }, ms);
    }

    return () => {
      if (reminderTimeoutRef.current) clearTimeout(reminderTimeoutRef.current);
    };
  }, [savedSchedules, activeUser]);

  // Request notification permission function
  const requestNotificationPermission = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        setNotificationPermission(permission);
        if (permission === 'granted') {
          // Show a test notification
          showBrowserNotification(
            'MediTime - Notifications Enabled',
            'You will now receive medication reminders even when the app is closed!'
          );
        }
      });
    }
  };

  // Function to delete a saved schedule for the active user
  const deleteSchedule = (index) => {
    const scheduleToDelete = savedSchedules[index];
    const patientName = scheduleToDelete.patientName;
    
    // Handle different schedule structures for the confirmation message
    const medicineInfo = scheduleToDelete.medicines && scheduleToDelete.medicines.length > 0
      ? scheduleToDelete.medicines.map(m => m.medicineName).join(', ')
      : scheduleToDelete.medicineName || 'this schedule';

    if (window.confirm(`Are you sure you want to delete the schedule for ${patientName} - ${medicineInfo}?`)) {
      const updatedSchedules = savedSchedules.filter((_, i) => i !== index);
      setSavedSchedules(updatedSchedules);
      // Local storage update is handled by the useEffect hook
    }
  };

  // Function to clear all saved schedules for the active user
  const clearAllSchedules = () => {
    if (window.confirm(`Are you sure you want to delete ALL schedules for user "${activeUser}"? This action cannot be undone.`)) {
      setSavedSchedules([]);
      // Local storage update is handled by the useEffect hook
    }
  };

  // Handlers for user management
  const handleCreateUser = (newUserName) => {
    if (newUserName && !allUsers.includes(newUserName)) {
      const newUsers = [...allUsers, newUserName];
      setAllUsers(newUsers);
      setActiveUser(newUserName);
      setShowUserModal(false);
    } else if (allUsers.includes(newUserName)) {
      alert("User with this name already exists.");
    }
  };

  const handleSwitchUser = (user) => {
    setActiveUser(user);
    setShowUserModal(false);
  };

  const handleDeleteUser = (userToDelete) => {
    if (window.confirm(`Are you sure you want to delete user "${userToDelete}" and all their schedules? This is irreversible.`)) {
      const newUsers = allUsers.filter(u => u !== userToDelete);
      setAllUsers(newUsers);

      if (activeUser === userToDelete) {
        setActiveUser(newUsers.length > 0 ? newUsers[0] : null);
      }
    }
  };

  // Handlers for adding/removing medicines
  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { ...initialMedicineState, doseTimes: [''] }]
    }));
  };

  const removeMedicine = (index) => {
    if (formData.medicines.length > 1) {
      const newMedicines = formData.medicines.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        medicines: newMedicines
      }));
    }
  };
  
  const handlePatientNameChange = (value) => {
    setFormData(prev => ({
      ...prev,
      patientName: value
    }));
    if (errors.patientName) {
      setErrors(prev => ({ ...prev, patientName: '' }));
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index][field] = value;
    setFormData(prev => ({ ...prev, medicines: newMedicines }));

    if (errors.medicines && errors.medicines[index] && errors.medicines[index][field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (!newErrors.medicines) newErrors.medicines = [];
        if (!newErrors.medicines[index]) newErrors.medicines[index] = {};
        newErrors.medicines[index][field] = '';
        return newErrors;
      });
    }
  };

  const handleSchedulingMethodChange = (index, method) => {
    const newMedicines = [...formData.medicines];
    const medicine = newMedicines[index];
    medicine.schedulingMethod = method;
    medicine.selectedDays = method === 'daysPerWeek' ? medicine.selectedDays : [];
    medicine.daysGap = method === 'daysGap' ? medicine.daysGap : '';
    setFormData(prev => ({ ...prev, medicines: newMedicines }));
  };

  const handleDayToggle = (index, day) => {
    const newMedicines = [...formData.medicines];
    const medicine = newMedicines[index];
    medicine.selectedDays = medicine.selectedDays.includes(day)
      ? medicine.selectedDays.filter(d => d !== day)
      : [...medicine.selectedDays, day];
    setFormData(prev => ({ ...prev, medicines: newMedicines }));
  };

  const handleDoseTimeChange = (medicineIndex, doseIndex, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[medicineIndex].doseTimes[doseIndex] = value;
    setFormData(prev => ({ ...prev, medicines: newMedicines }));
  };

  const addDoseTime = (medicineIndex) => {
    const newMedicines = [...formData.medicines];
    newMedicines[medicineIndex].doseTimes.push('');
    setFormData(prev => ({ ...prev, medicines: newMedicines }));
  };

  const removeDoseTime = (medicineIndex, doseIndex) => {
    const newMedicines = [...formData.medicines];
    if (newMedicines[medicineIndex].doseTimes.length > 1) {
      newMedicines[medicineIndex].doseTimes = newMedicines[medicineIndex].doseTimes.filter((_, i) => i !== doseIndex);
      setFormData(prev => ({ ...prev, medicines: newMedicines }));
    }
  };

  const validateForm = () => {
    const newErrors = { medicines: [] };

    if (!formData.patientName.trim()) {
      newErrors.patientName = 'Patient name is required';
    }

    formData.medicines.forEach((medicine, index) => {
      const medicineErrors = {};

      if (!medicine.medicineName.trim()) {
        medicineErrors.medicineName = 'Medicine name is required';
      }

      if (!medicine.schedulingMethod) {
        medicineErrors.schedulingMethod = 'Please select a scheduling method';
      }

      if (medicine.schedulingMethod === 'daysPerWeek' && medicine.selectedDays.length === 0) {
        medicineErrors.selectedDays = 'Please select at least one day';
      }

      if (medicine.schedulingMethod === 'daysGap' && (!medicine.daysGap || medicine.daysGap < 1)) {
        medicineErrors.daysGap = 'Please enter a valid gap in days';
      }

      if (!medicine.timesPerDay || medicine.timesPerDay < 1) {
        medicineErrors.timesPerDay = 'Times per day must be at least 1';
      }

      const timePattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      medicine.doseTimes.forEach((time, doseIndex) => {
        if (time.trim() && !timePattern.test(time)) {
          medicineErrors[`doseTime${doseIndex}`] = 'Please enter time in HH:MM format';
        }
      });
      newErrors.medicines[index] = medicineErrors;
    });

    const hasMedicineErrors = newErrors.medicines.some(err => Object.keys(err).length > 0);
    if (!hasMedicineErrors) {
        delete newErrors.medicines;
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validateForm();
    
    const hasPatientError = !!validationErrors.patientName;
    const hasMedicineErrors = validationErrors.medicines && validationErrors.medicines.some(m => Object.keys(m).length > 0);

    if (hasPatientError || hasMedicineErrors) {
      setErrors(validationErrors);
      return;
    }
    
    if (!activeUser) {
      alert("Please create or select a user profile first.");
      setShowUserModal(true);
      return;
    }

    setErrors({});
    setSubmittedData(formData);
    setActiveTab('overview');
  };

  const resetForm = () => {
    setFormData({
      patientName: '',
      medicines: [{ ...initialMedicineState, doseTimes: [''] }]
    });
    setSubmittedData(null);
    setErrors({});
    setActiveTab('schedule');
  };

  // Grouped schedules for overview display
  const groupedSchedules = savedSchedules.reduce((acc, schedule, index) => {
    const patientName = schedule.patientName || "Unnamed Patient";
    if (!acc[patientName]) {
      acc[patientName] = [];
    }
    acc[patientName].push({ ...schedule, originalIndex: index });
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Permission Denied Modal */}
      <NotificationPermissionModal 
        show={showPermissionDeniedModal}
        onClose={() => setShowPermissionDeniedModal(false)}
      />

      {/* User Management Modal */}
      <UserManagementModal
        show={showUserModal}
        onClose={() => setShowUserModal(false)}
        users={allUsers}
        activeUser={activeUser}
        onCreateUser={handleCreateUser}
        onSwitchUser={handleSwitchUser}
        onDeleteUser={handleDeleteUser}
      />

      {/* Reminder Banner */}
      {reminder && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-100 border border-yellow-300 text-yellow-900 px-6 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-bounce">
          <Bell className="w-6 h-6 text-yellow-600" />
          <span>{reminder}</span>
          <button onClick={() => setReminder(null)} className="ml-4 text-yellow-700 hover:text-yellow-900 font-bold">Dismiss</button>
        </div>
      )}
      {/* Header */}
      <Header 
        notificationPermission={notificationPermission}
        requestNotificationPermission={requestNotificationPermission}
        onShowPermissionDeniedModal={() => setShowPermissionDeniedModal(true)}
        activeUser={activeUser}
        onShowUserModal={() => setShowUserModal(true)}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-white/60 backdrop-blur-sm rounded-xl p-1 mb-8 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'schedule'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Schedule
          </button>
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
        </div>

        {activeTab === 'schedule' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Form Section */}
            <ScheduleForm 
              formData={formData}
              errors={errors}
              weekdays={weekdays}
              onPatientNameChange={handlePatientNameChange}
              onMedicineChange={handleMedicineChange}
              onAddMedicine={addMedicine}
              onRemoveMedicine={removeMedicine}
              onSchedulingMethodChange={handleSchedulingMethodChange}
              onDayToggle={handleDayToggle}
              onDoseTimeChange={handleDoseTimeChange}
              onAddDoseTime={addDoseTime}
              onRemoveDoseTime={removeDoseTime}
              onSubmit={handleSubmit}
              onReset={resetForm}
            />

            {/* Preview Section */}
            <SchedulePreview submittedData={submittedData} />
          </div>
        )}

        {activeTab === 'overview' && (
          <Overview 
            activeUser={activeUser}
            savedSchedules={savedSchedules}
            groupedSchedules={groupedSchedules}
            onClearAllSchedules={clearAllSchedules}
            onDeleteSchedule={deleteSchedule}
            onShowUserModal={() => setShowUserModal(true)}
          />
        )}

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">MediTime</h3>
            </div>
            <p className="text-gray-600">
              Helping you stay on track with your medication schedule
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediTime;