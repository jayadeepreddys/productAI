"use client";

tsx
import { useState, useEffect } from 'react';
import { HealthPlan } from '../types/healthPlan';

export default function HealthPlanInfo() {
  const [plan, setPlan] = useState<HealthPlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulating an API call to fetch health plan data
    const fetchPlan = async () => {
      try {
        // Replace this with an actual API call in a real application
        const response = await new Promise<HealthPlan>((resolve) => {
          setTimeout(() => {
            resolve({
              id: '12345',
              name: 'Premium Health Coverage',
              type: 'PPO',
              monthlyCost: 299.99,
              deductible: 1000,
              coverageDetails: [
                'Comprehensive medical coverage',
                'Prescription drug coverage',
                'Mental health services',
                'Preventive care at no additional cost',
              ],
            });
          }, 1000);
        });
        setPlan(response);
      } catch (error) {
        console.error('Error fetching health plan:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlan();
  }, []);

  if (loading) {
    return <div className="text-center">Loading plan information...</div>;
  }

  if (!plan) {
    return <div className="text-center">Unable to load plan information. Please try again later.</div>;
  }

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-4">{plan.name}</h2>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <p className="font-medium">Plan Type:</p>
          <p>{plan.type}</p>
        </div>
        <div>
          <p className="font-medium">Monthly Cost:</p>
          <p>${plan.monthlyCost.toFixed(2)}</p>
        </div>
        <div>
          <p className="font-medium">Deductible:</p>
          <p>${plan.deductible.toFixed(2)}</p>
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Coverage Details:</h3>
        <ul className="list-disc list-inside">
          {plan.coverageDetails.map((detail, index) => (
            <li key={index}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}