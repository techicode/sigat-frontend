import { Users as UsersIcon } from 'lucide-react';

const Users = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-gray-900">
      <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
        <UsersIcon className="w-12 h-12 text-blue-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Usuarios y Empleados</h1>
      <p className="text-base text-gray-400 max-w-md">
        Esta sección está en desarrollo. Próximamente podrás gestionar usuarios del sistema y empleados de la organización.
      </p>
    </div>
  );
};

export default Users;
