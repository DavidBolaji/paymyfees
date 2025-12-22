'use client';

import { useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Upload, School } from 'lucide-react';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { verificationStepsData, schoolDetailsData } from '@/data';

export default function SchoolVerificationPage() {
  const [verificationStatus] = useState('completed'); // completed, pending, failed

  const verificationSteps = verificationStepsData.map(step => ({
    ...step,
    icon: step.id === 1 ? School :
          step.id === 2 ? Upload :
          CheckCircle
  }));

  const schoolDetails = schoolDetailsData;

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">School Verification</h1>
          <p className="text-gray-600">Manage your school verification status and details</p>
        </div>

        {/* Verification Status Card */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Verification Status</h2>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-green-700 font-medium">School Verified</span>
              </div>
            </div>
            <StatusBadge status="completed" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-3">School Details</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Name:</span> <span className="font-medium">{schoolDetails.name}</span></div>
                <div><span className="text-gray-600">Address:</span> <span className="font-medium">{schoolDetails.address}</span></div>
                <div><span className="text-gray-600">Phone:</span> <span className="font-medium">{schoolDetails.phone}</span></div>
                <div><span className="text-gray-600">Email:</span> <span className="font-medium">{schoolDetails.email}</span></div>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-3">Verification Info</h3>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-600">Verified Date:</span> <span className="font-medium">{schoolDetails.verificationDate}</span></div>
                <div><span className="text-gray-600">Status:</span> <span className="font-medium text-green-600">Verified</span></div>
                <div><span className="text-gray-600">Next Review:</span> <span className="font-medium">Dec 1, 2025</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Process */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Verification Process</h2>
          
          <div className="space-y-6">
            {verificationSteps.map((step, index) => (
              <div key={step.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    step.status === 'completed' 
                      ? 'bg-green-100 text-green-600' 
                      : step.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <step.icon className="w-5 h-5" />
                  </div>
                  {index < verificationSteps.length - 1 && (
                    <div className={`w-px h-12 mt-2 ${
                      step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                    }`} />
                  )}
                </div>

                <div className="flex-1 pb-8">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{step.title}</h3>
                    {step.status === 'completed' && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {step.status === 'pending' && (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}