// Debug script for schedule preview functionality
console.log('🔍 Debugging Schedule Preview...');

// Function to test preview with sample data
const testPreview = () => {
  console.log('🧪 Testing Schedule Preview with sample data...');
  
  // Simulate form data
  const sampleFormData = {
    patientName: 'John Doe',
    medicines: [
      {
        medicineName: 'Aspirin',
        schedulingMethod: 'daysPerWeek',
        selectedDays: ['Monday', 'Wednesday', 'Friday'],
        timesPerDay: 2,
        doseTimes: ['08:00', '20:00'],
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      },
      {
        medicineName: 'Vitamin D',
        schedulingMethod: 'daysGap',
        daysGap: 2,
        timesPerDay: 1,
        doseTimes: ['12:00'],
        startDate: '2024-01-01',
        endDate: ''
      }
    ]
  };
  
  console.log('Sample form data:', sampleFormData);
  console.log('✅ Preview should now show this data');
  
  return sampleFormData;
};

// Function to check current form state
const checkFormState = () => {
  console.log('📋 Checking current form state...');
  
  // This would be available in the React component context
  console.log('To check form state in the app:');
  console.log('1. Open browser console');
  console.log('2. Type: console.log(formData)');
  console.log('3. Check if patientName and medicines are populated');
};

// Function to simulate form filling
const simulateFormFilling = () => {
  console.log('🎯 To test the preview:');
  console.log('1. Go to the Schedule tab');
  console.log('2. Enter a patient name');
  console.log('3. Add medicine details');
  console.log('4. Watch the preview update in real-time');
  console.log('5. Check browser console for debug logs');
};

// Export functions for browser console
if (typeof window !== 'undefined') {
  window.testPreview = testPreview;
  window.checkFormState = checkFormState;
  window.simulateFormFilling = simulateFormFilling;
  
  console.log('✅ Debug functions available:');
  console.log('- testPreview() - Test with sample data');
  console.log('- checkFormState() - Check current form state');
  console.log('- simulateFormFilling() - Instructions for testing');
}

console.log('\n🎉 Schedule Preview Debug Ready!');
console.log('The preview should now show real-time updates as you fill the form.'); 