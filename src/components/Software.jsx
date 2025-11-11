import { Package } from 'lucide-react';

const Software = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center bg-gray-900">
      <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
        <Package className="w-12 h-12 text-blue-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-3">Catálogo de Software</h1>
      <p className="text-base text-gray-400 max-w-md">
        Esta sección está en desarrollo. Próximamente podrás gestionar el catálogo de software y sus instalaciones.
      </p>
    </div>
  );
};

export default Software;
