import { useState } from 'react';
import { Search, Plus, AlertTriangle, Clock, CheckCircle, History, PenTool as Tool } from 'lucide-react';
import { useClientStore } from '../store/clientStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const STATUS_COLORS = {
  functional: { bg: 'bg-green-100', text: 'text-green-800', label: 'Fonctionnel' },
  maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En maintenance' },
  waiting_parts: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Attente pièces' },
  warning: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Fonctionnel sous réserve' },
  obsolete: { bg: 'bg-red-100', text: 'text-red-800', label: 'Obsolète' }
};

export default function Equipment() {
  const { clients } = useClientStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Récupérer tous les équipements de tous les clients
  const allEquipments = clients.flatMap(client => 
    client.equipment.map(eq => ({
      ...eq,
      clientName: client.name,
      clientId: client.id
    }))
  );

  // Filtrer les équipements
  const filteredEquipments = allEquipments.filter(equipment => {
    const matchesSearch = 
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.clientName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || equipment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculer les alertes
  const alerts = allEquipments.filter(equipment => {
    if (equipment.status === 'maintenance' || equipment.status === 'waiting_parts') return true;
    if (equipment.nextMaintenance) {
      const maintenanceDate = new Date(equipment.nextMaintenance);
      const daysUntilMaintenance = Math.ceil((maintenanceDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilMaintenance <= 30;
    }
    return false;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Équipements</h2>
          <p className="mt-1 text-sm text-gray-500">
            Gérez et suivez l'état de vos équipements
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouvel équipement
        </button>
      </div>

      {/* Section Alertes */}
      {alerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((equipment, index) => (
            <div
              key={index}
              className="bg-white p-4 rounded-lg shadow border-l-4 border-yellow-500"
            >
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{equipment.name}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {equipment.status === 'maintenance' ? 'En maintenance' :
                     equipment.status === 'waiting_parts' ? 'En attente de pièces' :
                     'Maintenance préventive requise'}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Client: {equipment.clientName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Rechercher un équipement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {Object.entries(STATUS_COLORS).map(([status, { bg, text, label }]) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
                  className={`px-3 py-1 rounded-full text-sm ${
                    status === statusFilter ? `${bg} ${text}` : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Liste des équipements */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEquipments.map((equipment) => (
            <div
              key={equipment.id}
              className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
              onClick={() => setSelectedEquipment(equipment)}
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Tool className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900">{equipment.name}</h3>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[equipment.status].bg} ${STATUS_COLORS[equipment.status].text}`}>
                    {STATUS_COLORS[equipment.status].label}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-gray-500">
                  {equipment.brand && (
                    <p>{equipment.brand} {equipment.model}</p>
                  )}
                  <p>Client: {equipment.clientName}</p>
                  {equipment.serialNumber && (
                    <p>N° série: {equipment.serialNumber}</p>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-500">
                      <History className="h-4 w-4 mr-1" />
                      Dernière maintenance:
                    </div>
                    <span className="font-medium">
                      {equipment.lastMaintenance ? 
                        format(new Date(equipment.lastMaintenance), 'dd MMM yyyy', { locale: fr }) :
                        'Non disponible'
                      }
                    </span>
                  </div>
                  {equipment.nextMaintenance && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <div className="flex items-center text-gray-500">
                        <Clock className="h-4 w-4 mr-1" />
                        Prochaine maintenance:
                      </div>
                      <span className="font-medium">
                        {format(new Date(equipment.nextMaintenance), 'dd MMM yyyy', { locale: fr })}
                      </span>
                    </div>
                  )}
                </div>

                {equipment.status === 'waiting_parts' && equipment.pendingParts && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Pièces en attente:</h4>
                    <ul className="text-sm text-gray-500 list-disc list-inside">
                      {equipment.pendingParts.map((part, index) => (
                        <li key={index}>{part}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}