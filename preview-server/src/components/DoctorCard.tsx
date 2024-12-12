export function DoctorCard({ name, specialty }: { name: string; specialty: string }) {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 text-center">
      <img src="/placeholder-doctor.jpg" alt={name} className="w-32 h-32 rounded-full mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">{name}</h3>
      <p className="text-gray-600">{specialty}</p>
    </div>
  );
}