import React from 'react';
import { User, Pill, Calendar, Clock, Plus, Minus, Trash2, CheckCircle, AlertCircle } from 'lucide-react';

const ScheduleForm = ({
  formData,
  errors,
  weekdays,
  onPatientNameChange,
  onMedicineChange,
  onAddMedicine,
  onRemoveMedicine,
  onSchedulingMethodChange,
  onDayToggle,
  onDoseTimeChange,
  onAddDoseTime,
  onRemoveDoseTime,
  onSubmit,
  onReset,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-blue-100 p-3 rounded-xl">
          <Pill className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Schedule Medication</h2>
          <p className="text-gray-500">Configure your medication schedule</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Patient Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Patient Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name
                </label>
                <input
                  type="text"
                  value={formData.patientName}
                  onChange={(e) => onPatientNameChange(e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    errors.patientName ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Enter patient name"
                />
                {errors.patientName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.patientName}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {formData.medicines.map((medicine, index) => {
          const medicineErrors = (errors.medicines && errors.medicines[index]) || {};
          
          return (
          <div key={index} className="space-y-8 border-2 border-dashed border-gray-300 rounded-2xl p-4 relative mb-6">
            {formData.medicines.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveMedicine(index)}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all z-10"
              >
                <Minus className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center">
              <h3 className="text-xl font-bold text-gray-700">Medicine #{index + 1}</h3>
            </div>

            {/* Medicine Name */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Pill className="w-5 h-5 text-blue-600" />
                Medicine Information
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine Name
                </label>
                <input
                  type="text"
                  value={medicine.medicineName}
                  onChange={(e) => onMedicineChange(index, 'medicineName', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                    medicineErrors.medicineName ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Enter medicine name"
                />
                {medicineErrors.medicineName && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {medicineErrors.medicineName}
                  </p>
                )}
              </div>
            </div>

            {/* Scheduling Method */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-green-600" />
                Scheduling Method
              </h3>
              <div className="space-y-3">
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name={`schedulingMethod-${index}`}
                    checked={medicine.schedulingMethod === 'daysPerWeek'}
                    onChange={() => onSchedulingMethodChange(index, 'daysPerWeek')}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Fixed days per week</div>
                    <div className="text-sm text-gray-500">Choose specific days of the week</div>
                  </div>
                </label>
                <label className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                  <input
                    type="radio"
                    name={`schedulingMethod-${index}`}
                    checked={medicine.schedulingMethod === 'daysGap'}
                    onChange={() => onSchedulingMethodChange(index, 'daysGap')}
                    className="mr-3 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Repeating gap in days</div>
                    <div className="text-sm text-gray-500">Take medicine every X days</div>
                  </div>
                </label>
              </div>
              {medicineErrors.schedulingMethod && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {medicineErrors.schedulingMethod}
                </p>
              )}
            </div>

            {/* Days Selection */}
            {medicine.schedulingMethod === 'daysPerWeek' && (
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Days</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {weekdays.map(day => (
                    <label key={day} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-white/50 transition-colors cursor-pointer">
                      <input
                        type="checkbox"
                        checked={medicine.selectedDays.includes(day)}
                        onChange={() => onDayToggle(index, day)}
                        className="mr-3 text-purple-600"
                      />
                      <span className="font-medium text-gray-900">{day}</span>
                    </label>
                  ))}
                </div>
                {medicineErrors.selectedDays && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {medicineErrors.selectedDays}
                  </p>
                )}
              </div>
            )}

            {/* Days Gap */}
            {medicine.schedulingMethod === 'daysGap' && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Gap Between Days</h3>
                <input
                  type="number"
                  min="1"
                  value={medicine.daysGap}
                  onChange={(e) => onMedicineChange(index, 'daysGap', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all ${
                    medicineErrors.daysGap ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  placeholder="Enter number of days"
                />
                {medicineErrors.daysGap && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {medicineErrors.daysGap}
                  </p>
                )}
              </div>
            )}

            {/* Dosing Details */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-600" />
                Dosing Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Times per Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={medicine.timesPerDay}
                    onChange={(e) => onMedicineChange(index, 'timesPerDay', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all ${
                      medicineErrors.timesPerDay ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    placeholder="1"
                  />
                  {medicineErrors.timesPerDay && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {medicineErrors.timesPerDay}
                    </p>
                  )}
                </div>

                {parseInt(medicine.timesPerDay, 10) > 1 && (
                  <div className="flex gap-4 items-center mb-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={medicine.doseTimeRangeStart || '08:00'}
                        onChange={e => onMedicineChange(index, 'doseTimeRangeStart', e.target.value)}
                        className="px-2 py-1 border rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={medicine.doseTimeRangeEnd || '22:00'}
                        onChange={e => onMedicineChange(index, 'doseTimeRangeEnd', e.target.value)}
                        className="px-2 py-1 border rounded focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Dose Times - Optional */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Dose Times (Optional)
                </h3>
                <button
                  type="button"
                  onClick={() => onAddDoseTime(index)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1 bg-white px-3 py-1 rounded-lg border border-indigo-200 hover:border-indigo-300 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Time
                </button>
              </div>
              <div className="space-y-3">
                {medicine.doseTimes.map((time, doseIndex) => {
                  // Suggest next dose time if timesPerDay > 2 and not last input
                  let nextSuggestion = null;
                  const numDoses = parseInt(medicine.timesPerDay, 10);
                  if (
                    numDoses > 2 &&
                    doseIndex < medicine.doseTimes.length - 1 &&
                    time && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)
                  ) {
                    // Calculate next suggested time
                    const start = 8 * 60;
                    const end = 22 * 60;
                    const interval = (end - start) / (numDoses - 1);
                    const nextMinutes = Math.round(start + (doseIndex + 1) * interval);
                    const h = String(Math.floor(nextMinutes / 60)).padStart(2, '0');
                    const m = String(nextMinutes % 60).padStart(2, '0');
                    nextSuggestion = `${h}:${m}`;
                  }
                  return (
                    <div key={doseIndex} className="flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={time}
                        onChange={(e) => onDoseTimeChange(index, doseIndex, e.target.value)}
                        className={`flex-1 min-w-[120px] px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                          medicineErrors[`doseTime${doseIndex}`] ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        placeholder="HH:MM (e.g., 08:00)"
                      />
                      {medicine.doseTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onRemoveDoseTime(index, doseIndex)}
                          className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      {nextSuggestion && (
                        <span className="text-xs text-indigo-500 ml-2">Suggested next: {nextSuggestion}</span>
                      )}
                    </div>
                  );
                })}
              </div>
              {Object.keys(medicineErrors).some(key => key.startsWith('doseTime')) && (
                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Please check dose time formats (use HH:MM format)
                </p>
              )}
            </div>
             {/* Optional Date Range */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Date Range (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={medicine.startDate}
                    onChange={(e) => onMedicineChange(index, 'startDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={medicine.endDate}
                    onChange={(e) => onMedicineChange(index, 'endDate', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all hover:border-gray-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )})}

        <div className="mt-6">
          <button
            type="button"
            onClick={onAddMedicine}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 border-2 border-dashed border-gray-300 text-gray-600 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Another Medicine
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex flex-col sm:flex-row gap-4 pt-8">
          <button
            type="button"
            onClick={onSubmit}
            className="w-full sm:w-auto flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 font-semibold"
          >
            <CheckCircle className="w-5 h-5" />
            Schedule Medication
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-6 py-4 text-gray-600 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleForm; 