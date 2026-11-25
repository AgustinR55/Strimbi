import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await axios.post(`http://localhost:5000${endpoint}`, form);
      
      if (isLogin) {
        login(res.data.token, res.data.user);
        navigate('/dashboard');
      } else {
        alert('¡Registrado con éxito! Ahora inicia sesión.');
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error en el servidor');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">{isLogin ? 'Iniciar Sesión' : 'Registro'}</h2>
        {error && <p className="text-red-500 text-sm mb-4 bg-red-50 p-2 rounded">{error}</p>}
        
        {!isLogin && (
          <input type="text" placeholder="Nombre" className="w-full p-2 mb-4 border rounded" 
            onChange={e => setForm({...form, name: e.target.value})} required />
        )}
        <input type="email" placeholder="Email" className="w-full p-2 mb-4 border rounded" 
          onChange={e => setForm({...form, email: e.target.value})} required />
        <input type="password" placeholder="Contraseña" className="w-full p-2 mb-4 border rounded" 
          onChange={e => setForm({...form, password: e.target.value})} required />
        
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition">
          {isLogin ? 'Entrar' : 'Registrarse'}
        </button>
        
        <p className="mt-4 text-sm text-center cursor-pointer text-blue-500 hover:underline" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
        </p>
      </form>
    </div>
  );
}