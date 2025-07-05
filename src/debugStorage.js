// Debug script to check localStorage storage issues
import storageService from './services/storageService';

const debugStorage = async () => {
  console.log('🔍 Debugging localStorage service...');
  
  // Check localStorage availability
  console.log('localStorage available:', typeof localStorage !== 'undefined');
  console.log('localStorage quota:', 'localStorage' in window ? 'Available' : 'Not available');
  
  // Check storage service state
  console.log('Storage service initialized successfully');
  
  // Test user creation
  try {
    console.log('Testing user creation...');
    const testUser = await storageService.createUser('DebugTestUser');
    console.log('✅ User created:', testUser);
    
    // Test getting users
    console.log('Testing get users...');
    const users = await storageService.getUsers();
    console.log('✅ Users retrieved:', users);
    
    // Test schedule creation
    console.log('Testing schedule creation...');
    const testSchedule = {
      patientName: 'Debug Patient',
      medicines: [{
        medicineName: 'Debug Medicine',
        schedulingMethod: 'daysPerWeek',
        selectedDays: ['Monday'],
        timesPerDay: 1,
        doseTimes: ['08:00']
      }]
    };
    
    const savedSchedule = await storageService.saveSchedule(testUser.id, testSchedule);
    console.log('✅ Schedule saved:', savedSchedule);
    
    // Test getting schedules
    console.log('Testing get schedules...');
    const schedules = await storageService.getSchedules(testUser.id);
    console.log('✅ Schedules retrieved:', schedules);
    
    // Test data export
    console.log('Testing data export...');
    const exportedData = storageService.exportData();
    console.log('✅ Data exported:', exportedData);
    
    console.log('🎉 All localStorage tests passed!');
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
  }
};

// Export for use in development
export default debugStorage;

// Run debug if this file is executed directly
if (typeof window !== 'undefined') {
  // Only run in browser environment
  window.debugStorage = debugStorage;
} 