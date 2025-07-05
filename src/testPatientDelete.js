// Test for patient-specific schedule deletion
import storageService from './services/storageService';

const testPatientDelete = async () => {
  console.log('🧪 Testing Patient-Specific Schedule Deletion...');
  
  try {
    // Clear all data to start fresh
    console.log('\n1. Clearing all data...');
    storageService.clearAllData();
    console.log('✅ Data cleared successfully');
    
    // Create a test user
    console.log('\n2. Creating test user...');
    const testUser = await storageService.createUser('TestUser');
    console.log('✅ User created:', testUser);
    
    // Create multiple schedules for different patients
    console.log('\n3. Creating schedules for different patients...');
    const schedule1 = {
      patientName: 'Patient A',
      medicines: [{
        medicineName: 'Medicine A1',
        schedulingMethod: 'daysPerWeek',
        selectedDays: ['Monday'],
        timesPerDay: 1,
        doseTimes: ['08:00']
      }]
    };
    
    const schedule2 = {
      patientName: 'Patient A',
      medicines: [{
        medicineName: 'Medicine A2',
        schedulingMethod: 'daysPerWeek',
        selectedDays: ['Tuesday'],
        timesPerDay: 1,
        doseTimes: ['12:00']
      }]
    };
    
    const schedule3 = {
      patientName: 'Patient B',
      medicines: [{
        medicineName: 'Medicine B1',
        schedulingMethod: 'daysGap',
        daysGap: 2,
        timesPerDay: 1,
        doseTimes: ['18:00']
      }]
    };
    
    const savedSchedule1 = await storageService.saveSchedule(testUser.id, schedule1);
    const savedSchedule2 = await storageService.saveSchedule(testUser.id, schedule2);
    const savedSchedule3 = await storageService.saveSchedule(testUser.id, schedule3);
    console.log('✅ Schedules created for Patient A (2) and Patient B (1)');
    
    // Verify schedules exist
    console.log('\n4. Verifying schedules...');
    const allSchedules = await storageService.getSchedules(testUser.id);
    console.log('✅ Total schedules:', allSchedules.length);
    console.log('Patient A schedules:', allSchedules.filter(s => s.patientName === 'Patient A').length);
    console.log('Patient B schedules:', allSchedules.filter(s => s.patientName === 'Patient B').length);
    
    // Test deleting schedules for Patient A
    console.log('\n5. Testing delete schedules for Patient A...');
    const result = await storageService.deleteSchedulesByPatient(testUser.id, 'Patient A');
    console.log('✅ Delete operation result:', result);
    
    // Verify Patient A schedules are deleted but Patient B remains
    console.log('\n6. Verifying deletion...');
    const remainingSchedules = await storageService.getSchedules(testUser.id);
    console.log('✅ Remaining schedules:', remainingSchedules.length);
    console.log('Patient A schedules:', remainingSchedules.filter(s => s.patientName === 'Patient A').length);
    console.log('Patient B schedules:', remainingSchedules.filter(s => s.patientName === 'Patient B').length);
    
    if (remainingSchedules.filter(s => s.patientName === 'Patient A').length === 0 && 
        remainingSchedules.filter(s => s.patientName === 'Patient B').length === 1) {
      console.log('✅ Patient-specific deletion working correctly!');
    } else {
      console.log('❌ Patient-specific deletion failed');
    }
    
    console.log('\n🎉 Patient-specific schedule deletion test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
};

// Export for use in browser console
if (typeof window !== 'undefined') {
  window.testPatientDelete = testPatientDelete;
}

export default testPatientDelete; 