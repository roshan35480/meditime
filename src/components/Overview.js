import React from 'react';
import { User, Calendar, Trash2, Users } from 'lucide-react';
import { convert24To12 } from '../utils/timeUtils';

const Overview = ({
  activeUser,
  savedSchedules,
  groupedSchedules,
  onClearAllSchedules,
  onDeleteSchedule,
  onDeleteSchedulesByPatient,
  onShowUserModal,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-4 sm:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          Schedule Overview for <span className="text-blue-600">{activeUser || '...'}</span>
        </h2>
        {activeUser && savedSchedules.length > 0 && (
          <button
            onClick={onClearAllSchedules}
            className="w-full sm:w-auto flex items-center justify-center sm:justify-start gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Schedules
          </button>
        )}
      </div>

      {!activeUser ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">Please create or select a user to view schedules.</p>
          <button
            onClick={onShowUserModal}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center gap-2 mx-auto"
          >
            <Users className="w-5 h-5" />
            Manage Users
          </button>
        </div>
      ) : savedSchedules.length === 0 ? (
        <div className="text-center py-12">
          <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Schedules Yet</h3>
          <p className="text-gray-500">
            Go to the 'Schedule' tab to create a new medication schedule for <span className="font-semibold">{activeUser}</span>.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedSchedules).map(([patientName, schedulesForPatient]) => (
            <div key={patientName} className="bg-white/50 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <User className="w-6 h-6 text-blue-600" />
                  <span>{patientName}</span>
                </h4>
                {schedulesForPatient.length > 0 && (
                  <button
                    onClick={() => onDeleteSchedulesByPatient(patientName)}
                    className="flex items-center gap-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium"
                    title={`Delete all schedules for ${patientName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete All ({schedulesForPatient.length})
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schedulesForPatient.map((sched) => {
                  const isNewFormat = !!sched.medicines;
                  return (
                    <div key={sched.originalIndex} className="bg-white rounded-xl shadow-lg p-4 border border-gray-100 hover:shadow-xl transition-shadow relative group">
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onDeleteSchedule(sched.originalIndex)}
                          className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition-all"
                          title={`Delete schedule for ${sched.patientName}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {isNewFormat ? (
                        sched.medicines.map((med, medIdx) => (
                          <div key={medIdx} className="mb-2 pb-2 border-b last:border-b-0 border-gray-200">
                            <div className="text-gray-800 font-semibold">{med.medicineName}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {med.schedulingMethod === 'daysPerWeek'
                                ? `Days: ${med.selectedDays.join(', ')}`
                                : `Every ${med.daysGap} days`
                              }
                            </div>
                            <div className="text-xs text-gray-500">
                              Times: {med.doseTimes.filter(Boolean).map(time => convert24To12(time)).join(', ') || 'Not specified'}
                            </div>
                            <div className="text-xs text-gray-400">
                              Start: {med.startDate || 'N/A'} | End: {med.endDate || 'N/A'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="text-gray-700 mb-1">{sched.medicineName}</div>
                          <div className="text-xs text-gray-500 mb-1">
                            {sched.schedulingMethod === 'daysPerWeek' 
                              ? `Days: ${sched.selectedDays.join(', ')}` 
                              : `Every ${sched.daysGap} days`
                            }
                          </div>
                          <div className="text-xs text-gray-500 mb-1">
                            Times: {(sched.doseTimes || []).filter(Boolean).map(time => convert24To12(time)).join(', ') || 'Not specified'}
                          </div>
                          <div className="text-xs text-gray-400">
                            Start: {sched.startDate || 'N/A'} | End: {sched.endDate || 'N/A'}
                          </div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Overview; 