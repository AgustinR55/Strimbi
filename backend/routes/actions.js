const router = require('express').Router();
const Log = require('../models/Log');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Registrar acción
router.post('/', auth, async (req, res) => {
  try {
    const { actionType } = req.body;
    const userId = req.user._id;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Regla de negocio: Límite diario de 5 acciones
    const todayLogs = await Log.countDocuments({ userId, createdAt: { $gte: today } });
    if (todayLogs >= 5) {
      return res.status(400).json({ error: true, message: 'Límite diario alcanzado. No puedes registrar más de 5 acciones por día.' });
    }

    // Regla de negocio: No duplicados el mismo día
    const duplicate = await Log.findOne({ userId, actionType, createdAt: { $gte: today } });
    if (duplicate) {
      return res.status(400).json({ error: true, message: 'Ya registraste esta acción hoy.' });
    }

    // Regla de negocio: Puntuación base (calculada en el servidor, no en el frontend)
    const pointsMap = { 'Transporte': 10, 'Reciclaje': 5, 'Energía': 8, 'Agua': 6 };
    const points = pointsMap[actionType];

    const newLog = new Log({ userId, actionType, points });
    await newLog.save();

    // Actualizar usuario
    const user = await User.findById(userId);
    user.ecoPoints += points;
    user.lastActionDate = Date.now();
    user.updateLevel();
    await user.save();

    res.status(201).json({ error: false, message: 'Acción registrada', points: user.ecoPoints, level: user.level });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// Obtener historial (para la gráfica)
router.get('/', auth, async (req, res) => {
  try {
    const logs = await Log.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json({ error: false, logs });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;