import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, setUser, token, logout } = useAuth();
  const [logs, setLogs] = useState([]);
  const [canRegister, setCanRegister] = useState(true);
  const [message, setMessage] = useState('');
  const [showCelebration, setShowCelebration] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.get('http://localhost:5000/api/actions', config);
      setLogs(res.data.logs);

      // Validar límite diario
      const today = new Date().setHours(0,0,0,0);
      const todayLogs = res.data.logs.filter(log => new Date(log.createdAt).getTime() >= today);
      if (todayLogs.length >= 5) setCanRegister(false);
      else setCanRegister(true);

    } catch (error) {
      console.error(error);
    }
  };

  const handleRegisterAction = async (actionType) => {
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const res = await axios.post('http://localhost:5000/api/actions', { actionType }, config);
      
      // Actualizar el estado global del usuario
      setUser(prev => ({ ...prev, ecoPoints: res.data.points, level: res.data.level }));
      
      setMessage('¡Acción registrada con éxito!');
      
      // Si subió de nivel, mostrar celebración
      if (res.data.level !== user.level) {
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 3000);
      }
      
      fetchLogs();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error al registrar acción');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const chartData = [
    { name: 'Transporte', pts: logs.filter(l => l.actionType === 'Transporte').length * 10 },
    { name: 'Reciclaje', pts: logs.filter(l => l.actionType === 'Reciclaje').length * 5 },
    { name: 'Energía', pts: logs.filter(l => l.actionType === 'Energía').length * 8 },
    { name: 'Agua', pts: logs.filter(l => l.actionType === 'Agua').length * 6 },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">EcoTrack</h1>
        <button onClick={handleLogout} className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
          Cerrar Sesión
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">Hola, <span className="font-semibold">{user?.name}</span></p>

      {showCelebration && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 animate-bounce font-bold text-center">
          🎉 ¡Felicidades! Has subido al nivel {user.level} 🌱
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg opacity-90">EcoPuntos</h2>
          <p className="text-4xl font-bold">{user?.ecoPoints}</p>
        </div>
        <div className="bg-emerald-500 text-white p-4 rounded-lg shadow-lg">
          <h2 className="text-lg opacity-90">Nivel Actual</h2>
          <p className="text-4xl font-bold">{user?.level}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg mb-8 h-64 border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">Tus últimas acciones</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="pts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-100">
        <h3 className="font-semibold text-gray-700 mb-4">Registrar Acción</h3>
        {message && <p className="text-sm text-blue-600 font-medium mb-4">{message}</p>}
        <div className="flex flex-wrap gap-3">
          {['Transporte', 'Reciclaje', 'Energía', 'Agua'].map(action => (
            <button
              key={action}
              onClick={() => handleRegisterAction(action)}
              disabled={!canRegister}
              className={`px-4 py-2 rounded font-medium text-white transition ${
                canRegister ? 'bg-blue-600 hover:bg-blue-700 shadow-md' : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              + {action}
            </button>
          ))}
        </div>
        {!canRegister && <p className="text-red-500 text-sm mt-3 font-medium">Has alcanzado el límite de 5 acciones diarias.</p>}
      </div>
    </div>
  );
}