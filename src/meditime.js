import React, { useState, useEffect, useRef } from 'react';
import { Clock, Bell } from 'lucide-react';
import UserManagementModal from './components/UserManagementModal';
import NotificationPermissionModal from './components/NotificationPermissionModal';
import Header from './components/Header';
import ScheduleForm from './components/ScheduleForm';
import SchedulePreview from './components/SchedulePreview';
import Overview from './components/Overview';
import storageService from './services/storageService';

// Define initial state for a single medicine
const initialMedicineState = {
  medicineName: '',
  schedulingMethod: '', // 'daysPerWeek' or 'daysGap'
  selectedDays: [],
  daysGap: '',
  timesPerDay: '',
  doseTimes: [''],
  startDate: '',
  endDate: '',
  doseTimeRangeStart: '08:00',
  doseTimeRangeEnd: '22:00',
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
  const soundIntervalRef = useRef(null);

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

  // Load data from storage service on mount and when activeUser changes
  useEffect(() => {
    const loadData = async () => {
      try {
        const users = await storageService.getUsers();
        setAllUsers(users.map(user => user.name));
        
        if (users.length > 0) {
          const lastUser = localStorage.getItem('lastActiveUser');
          const selectedUser = lastUser && users.find(u => u.name === lastUser) 
            ? lastUser 
            : users[0].name;
          
          setActiveUser(selectedUser);
          
          // Load schedules for the selected user
          const user = users.find(u => u.name === selectedUser);
          if (user) {
            const schedules = await storageService.getSchedules(user.id);
            setSavedSchedules(schedules);
          }
          
          // Load form data for the selected user
          const formData = await storageService.getFormData(user.id);
          if (formData) {
            setFormData(formData);
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

  // Persist formData to storage service per user on change
  useEffect(() => {
    const saveFormData = async () => {
      if (!activeUser) return;
      
      try {
        const users = await storageService.getUsers();
        const user = users.find(u => u.name === activeUser);
        if (user) {
          await storageService.saveFormData(user.id, formData);
        }
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    };
    
    saveFormData();
  }, [formData, activeUser]);

  // Save active user to localStorage for persistence
  useEffect(() => {
    if (activeUser) {
      localStorage.setItem('lastActiveUser', activeUser);
    }
  }, [activeUser]);

  // Effect to update displayed schedules when active user changes
  useEffect(() => {
    const loadSchedulesForUser = async () => {
      if (!activeUser) {
        setSavedSchedules([]);
        return;
      }
      
      try {
        const users = await storageService.getUsers();
        const user = users.find(u => u.name === activeUser);
        if (user) {
          const schedules = await storageService.getSchedules(user.id);
          setSavedSchedules(schedules);
        }
      } catch (error) {
        console.error('Error loading schedules for user:', error);
      }
    };
    
    loadSchedulesForUser();
  }, [activeUser]);

  // Refresh schedules when submittedData changes (after successful save)
  useEffect(() => {
    const refreshSchedules = async () => {
      if (submittedData && activeUser) {
        try {
          const users = await storageService.getUsers();
          const user = users.find(u => u.name === activeUser);
          if (user) {
            // Refresh schedules to show the newly saved one
            const schedules = await storageService.getSchedules(user.id);
            setSavedSchedules(schedules);
          }
        } catch (error) {
          console.error('Error refreshing schedules:', error);
        }
      }
    };
    
    refreshSchedules();
  }, [submittedData, activeUser]);

  // Function to play reminder sound using Text-to-Speech
  const playReminderSound = (message) => {
    try {
      if ('speechSynthesis' in window) {
        // Stop any previous speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.lang = 'en-US';
        utterance.rate = 1;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
      } else {
        console.log("Speech synthesis not supported.");
      }
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
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
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
        const ttsMessage = `${reminderPatient}, it is time to take your ${reminderMedicine.medicineName}.`;
        
        setReminder({
          patient: reminderPatient,
          medicine: reminderMedicine.medicineName,
          time: soonestDose.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        
        // Play immediately and then start interval
        playReminderSound(ttsMessage);
        soundIntervalRef.current = setInterval(() => {
          playReminderSound(ttsMessage);
        }, 10000); // Repeats every 10 seconds

        showBrowserNotification(
          'MediTime - Medication Reminder',
          `${reminderPatient}: Take ${reminderMedicine.medicineName} now`
        );
      }, ms);
    }

    return () => {
      if (reminderTimeoutRef.current) clearTimeout(reminderTimeoutRef.current);
      if (soundIntervalRef.current) clearInterval(soundIntervalRef.current);
    };
  }, [savedSchedules, activeUser]);

  const handleDismissReminder = () => {
    setReminder(null);
    if (soundIntervalRef.current) {
      clearInterval(soundIntervalRef.current);
      soundIntervalRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

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
  const deleteSchedule = async (index) => {
    const scheduleToDelete = savedSchedules[index];
    const patientName = scheduleToDelete.patientName;
    
    // Handle different schedule structures for the confirmation message
    const medicineInfo = scheduleToDelete.medicines && scheduleToDelete.medicines.length > 0
      ? scheduleToDelete.medicines.map(m => m.medicineName).join(', ')
      : scheduleToDelete.medicineName || 'this schedule';

    if (window.confirm(`Are you sure you want to delete the schedule for ${patientName} - ${medicineInfo}?`)) {
      try {
        await storageService.deleteSchedule(scheduleToDelete.id, activeUser);
        const updatedSchedules = savedSchedules.filter((_, i) => i !== index);
        setSavedSchedules(updatedSchedules);
      } catch (error) {
        console.error('Error deleting schedule:', error);
        alert("Failed to delete schedule. Please try again.");
      }
    }
  };

  // Function to clear all saved schedules for the active user
  const clearAllSchedules = async () => {
    if (window.confirm(`Are you sure you want to delete ALL schedules for user "${activeUser}"? This action cannot be undone.`)) {
      try {
        const users = await storageService.getUsers();
        const user = users.find(u => u.name === activeUser);
        if (user) {
          await storageService.deleteAllSchedules(user.id);
          setSavedSchedules([]);
        }
      } catch (error) {
        console.error('Error clearing schedules:', error);
        alert("Failed to clear schedules. Please try again.");
      }
    }
  };

  // Function to delete all schedules for a specific patient
  const deleteSchedulesByPatient = async (patientName) => {
    if (window.confirm(`Are you sure you want to delete ALL schedules for patient "${patientName}"? This action cannot be undone.`)) {
      try {
        const users = await storageService.getUsers();
        const user = users.find(u => u.name === activeUser);
        if (user) {
          await storageService.deleteSchedulesByPatient(user.id, patientName);
          // Refresh schedules after deletion
          const updatedSchedules = await storageService.getSchedules(user.id);
          setSavedSchedules(updatedSchedules);
        }
      } catch (error) {
        console.error('Error deleting schedules for patient:', error);
        alert("Failed to delete schedules for patient. Please try again.");
      }
    }
  };

  // Handlers for user management
  const handleCreateUser = async (newUserName) => {
    try {
      if (newUserName && !allUsers.includes(newUserName)) {
        const newUser = await storageService.createUser(newUserName);
        const newUsers = [...allUsers, newUser.name];
        setAllUsers(newUsers);
        setActiveUser(newUser.name);
        setShowUserModal(false);
      } else if (allUsers.includes(newUserName)) {
        alert("User with this name already exists.");
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert("Failed to create user. Please try again.");
    }
  };

  const handleSwitchUser = async (userName) => {
    try {
      setActiveUser(userName);
      setShowUserModal(false);
      
      // Load schedules for the selected user
      const users = await storageService.getUsers();
      const user = users.find(u => u.name === userName);
      if (user) {
        const schedules = await storageService.getSchedules(user.id);
        setSavedSchedules(schedules);
      }
    } catch (error) {
      console.error('Error switching user:', error);
    }
  };

  const handleDeleteUser = async (userToDelete) => {
    if (window.confirm(`Are you sure you want to delete user "${userToDelete}" and all their schedules? This is irreversible.`)) {
      try {
        const users = await storageService.getUsers();
        const user = users.find(u => u.name === userToDelete);
        if (user) {
          await storageService.deleteUser(user.id);
          const newUsers = allUsers.filter(u => u !== userToDelete);
          setAllUsers(newUsers);

          if (activeUser === userToDelete) {
            setActiveUser(newUsers.length > 0 ? newUsers[0] : null);
          }
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert("Failed to delete user. Please try again.");
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
    // If timesPerDay or time range is changed, set default doseTimes
    if (field === 'timesPerDay' || field === 'doseTimeRangeStart' || field === 'doseTimeRangeEnd') {
      const numDoses = parseInt(field === 'timesPerDay' ? value : newMedicines[index].timesPerDay, 10);
      const startTime = field === 'doseTimeRangeStart' ? value : (newMedicines[index].doseTimeRangeStart || '08:00');
      const endTime = field === 'doseTimeRangeEnd' ? value : (newMedicines[index].doseTimeRangeEnd || '22:00');
      if (!isNaN(numDoses) && numDoses > 0) {
        let doseTimes = [];
        if (numDoses === 1) {
          doseTimes = ['10:00'];
        } else {
          // Parse start and end time to minutes
          const [startH, startM] = startTime.split(':').map(Number);
          const [endH, endM] = endTime.split(':').map(Number);
          const start = (isNaN(startH) ? 8 : startH) * 60 + (isNaN(startM) ? 0 : startM);
          const end = (isNaN(endH) ? 22 : endH) * 60 + (isNaN(endM) ? 0 : endM);
          const interval = (end - start) / (numDoses - 1);
          for (let i = 0; i < numDoses; i++) {
            const minutes = Math.round(start + i * interval);
            const h = String(Math.floor(minutes / 60)).padStart(2, '0');
            const m = String(minutes % 60).padStart(2, '0');
            doseTimes.push(`${h}:${m}`);
          }
        }
        if (field === 'timesPerDay') newMedicines[index][field] = value;
        if (field === 'doseTimeRangeStart') newMedicines[index].doseTimeRangeStart = value;
        if (field === 'doseTimeRangeEnd') newMedicines[index].doseTimeRangeEnd = value;
        newMedicines[index].doseTimes = doseTimes;
      } else {
        newMedicines[index][field] = value;
        newMedicines[index].doseTimes = [''];
      }
    } else {
      newMedicines[index][field] = value;
    }
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

    const timePattern24 = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    const timePattern12 = /^(\d{1,2}):(\d{2})\s*(AM|PM|am|pm)$/;
      medicine.doseTimes.forEach((time, doseIndex) => {
      if (time.trim() && !timePattern24.test(time) && !timePattern12.test(time)) {
          medicineErrors[`doseTime${doseIndex}`] = 'Please enter time in HH:MM AM/PM format (e.g., 08:00 AM)';
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

  const handleSubmit = async () => {
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

    try {
      setErrors({});
      setSubmittedData(formData);
      setActiveTab('overview');
      
      // Save schedule to database
      const users = await storageService.getUsers();
      const user = users.find(u => u.name === activeUser);
      if (user) {
        await storageService.saveSchedule(user.id, formData);
        
        // Remove form data after successful save
        await storageService.deleteFormData(user.id);
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert("Failed to save schedule. Please try again.");
    }
  };

  const resetForm = async () => {
    setFormData({
      patientName: '',
      medicines: [{ ...initialMedicineState, doseTimes: [''] }]
    });
    setSubmittedData(null);
    setErrors({});
    setActiveTab('schedule');
    
    // Remove formData for current user from storage
    if (activeUser) {
      try {
        const users = await storageService.getUsers();
        const user = users.find(u => u.name === activeUser);
        if (user) {
          await storageService.deleteFormData(user.id);
        }
      } catch (error) {
        console.error('Error deleting form data:', error);
      }
    }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-60 backdrop-blur-sm">
          <div role="alert" className="relative w-full max-w-md bg-gradient-to-br from-yellow-100 to-amber-200 border-2 border-yellow-300 text-yellow-900 p-6 rounded-2xl shadow-2xl text-center">
              <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-yellow-200/80 flex items-center justify-center animate-bounce border-4 border-white/50">
                  <Bell className="w-10 h-10 text-yellow-700" />
              </div>
              <h3 className="text-2xl font-bold text-yellow-900 mb-2">Medication Reminder</h3>
              <p className="mb-1 text-lg"><span className="font-semibold">{reminder.patient}</span></p>
              <p className="mb-4 text-lg">
                  Time to take <span className="font-semibold">{reminder.medicine}</span>
              </p>
              <p className="mb-6 text-2xl font-bold text-yellow-800 bg-white/50 rounded-lg py-2">
                  {reminder.time}
              </p>
              <button 
                  onClick={handleDismissReminder} 
                  className="w-full px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg"
              >
                  Dismiss
              </button>
          </div>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
            <SchedulePreview submittedData={formData} />
          </div>
        )}

        {activeTab === 'overview' && (
          <Overview 
            activeUser={activeUser}
            savedSchedules={savedSchedules}
            groupedSchedules={groupedSchedules}
            onClearAllSchedules={clearAllSchedules}
            onDeleteSchedule={deleteSchedule}
            onDeleteSchedulesByPatient={deleteSchedulesByPatient}
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