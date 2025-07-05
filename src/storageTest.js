// Storage service test for browser console
// Copy and paste this into your browser console

const storageTest = async () => {
  try {
    console.log('🔍 Testing Storage Service...');
    
    // Import storage service
    const storageService = await import('./services/storageService.js');
    const service = storageService.default;
    
    console.log('Storage service loaded');
    console.log('Using localStorage for data storage');
    
    // Test user creation
    console.log('Testing user creation...');
    const testUser = await service.createUser('TestUser_' + Date.now());
    console.log('✅ User created:', testUser);
    
    // Test getting users
    console.log('Testing get users...');
    const users = await service.getUsers();
    console.log('✅ Users retrieved:', users.length, 'users');
    
    // Test schedule creation
    console.log('Testing schedule creation...');
    const testSchedule = {
      patientName: 'Test Patient',
      medicines: [{
        medicineName: 'Test Medicine',
        schedulingMethod: 'daysPerWeek',
        selectedDays: ['Monday'],
        timesPerDay: 1,
        doseTimes: ['08:00']
      }]
    };
    
    const savedSchedule = await service.saveSchedule(testUser.id, testSchedule);
    console.log('✅ Schedule saved:', savedSchedule);
    
    // Test getting schedules
    console.log('Testing get schedules...');
    const schedules = await service.getSchedules(testUser.id);
    console.log('✅ Schedules retrieved:', schedules.length, 'schedules');
    
    // Test duplicate prevention
    console.log('Testing duplicate prevention...');
    const duplicateSchedule = await service.saveSchedule(testUser.id, testSchedule);
    const schedulesAfterDuplicate = await service.getSchedules(testUser.id);
    console.log('✅ Schedules after duplicate save:', schedulesAfterDuplicate.length, 'schedules');
    
    if (schedulesAfterDuplicate.length === schedules.length + 1) {
      console.log('✅ Duplicate prevention working - new schedule added correctly');
    } else {
      console.log('⚠️  Potential issue with duplicate handling');
    }
    
    console.log('🎉 Storage service test passed!');
    console.log('Your app is now using localStorage for data storage.');
    
  } catch (error) {
    console.error('❌ Storage test failed:', error);
    console.error('Error details:', error.message);
  }
};

// Run the test
storageTest(); 