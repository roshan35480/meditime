import React from 'react';
import { Clock, CheckCircle, Star, Pill } from 'lucide-react';

const SchedulePreview = ({ submittedData }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-green-100 p-3 rounded-xl">
          <CheckCircle className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Preview</h2>
          <p className="text-gray-500">Review your medication schedule</p>
        </div>
      </div>
      
      {submittedData ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="font-bold text-green-800 text-lg">Schedule Created Successfully!</h3>
            </div>
            <p className="text-green-700">
              Your medication schedule has been configured and is ready for implementation.
            </p>
          </div>

          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Schedule Details
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200">
                <span className="font-medium text-gray-600">Patient:</span>
                <span className="font-semibold text-gray-900 sm:text-right">{submittedData.patientName}</span>
              </div>
              {submittedData.medicines.map((medicine, index) => (
                <div key={index} className="py-4 border-b border-gray-200 last:border-b-0">
                   <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center text-blue-700 font-bold mb-2">
                     <span className="flex items-center gap-2"><Pill className="w-4 h-4"/>Medicine #{index + 1}</span>
                     <span className="sm:text-right">{medicine.medicineName}</span>
                   </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-t border-gray-200">
                    <span className="font-medium text-gray-600">Schedule Type:</span>
                    <span className="font-semibold text-gray-900 sm:text-right">
                      {medicine.schedulingMethod === 'daysPerWeek' 
                        ? `Fixed days: ${medicine.selectedDays.join(', ')}`
                        : `Every ${medicine.daysGap} day(s)`
                      }
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-600">Frequency:</span>
                    <span className="font-semibold text-gray-900 sm:text-right">{medicine.timesPerDay} time(s) per day</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200">
                    <span className="font-medium text-gray-600">Dose Times:</span>
                    <span className="font-semibold text-gray-900 sm:text-right">
                      {medicine.doseTimes.filter(time => time.trim()).length > 0 
                        ? medicine.doseTimes.filter(time => time.trim()).join(', ')
                        : 'Not specified'
                      }
                    </span>
                  </div>
                  {medicine.startDate && (
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2 border-b border-gray-200">
                      <span className="font-medium text-gray-600">Start Date:</span>
                      <span className="font-semibold text-gray-900 sm:text-right">{medicine.startDate}</span>
                    </div>
                  )}
                  {medicine.endDate && (
                    <div className="flex flex-col sm:flex-row sm:justify-between py-2">
                      <span className="font-medium text-gray-600">End Date:</span>
                      <span className="font-semibold text-gray-900 sm:text-right">{medicine.endDate}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Only show JSON data in development mode */}
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-blue-50 rounded-xl p-6">
              <h4 className="font-bold text-blue-900 mb-4">JSON Data (For Development)</h4>
              <pre className="text-xs bg-white p-4 rounded-lg border overflow-auto max-h-48 text-blue-800">
                {JSON.stringify(submittedData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedule Yet</h3>
          <p className="text-gray-500">
            Fill out the form to preview your medication schedule
          </p>
        </div>
      )}
    </div>
  );
};

export default SchedulePreview; 