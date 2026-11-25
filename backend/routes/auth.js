const router = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth'); // Importamos el middleware

// Registro
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Regla de negocio: validación de contraseña (8 chars, 1 mayuscula, 1 num, 1 simbolo)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: true, message: 'La contraseña no cumple con los requisitos de seguridad.' });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ error: true, message: 'El email ya está registrado.' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ error: false, message: 'Usuario registrado con éxito.' });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: true, message: 'Credenciales inválidas.' });

    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) return res.status(400).json({ error: true, message: 'Credenciales inválidas.' });

    // Regla de inactividad
    const daysSinceLastAction = (Date.now() - new Date(user.lastActionDate).getTime()) / (1000 * 3600 * 24);
    if (daysSinceLastAction >= 7) {
      user.ecoPoints = Math.max(0, user.ecoPoints - 10);
      user.lastActionDate = Date.now();
    }

    // 👇 ESTO ES LO QUE FALTABA: Recalcular el nivel siempre, al final
    user.updateLevel();
    await user.save();

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.header('Authorization', `Bearer ${token}`).json({ error: false, token, user });
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

// OBTENER DATOS (/me)
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ error: true, message: 'Usuario no encontrado' });

    // Regla de inactividad
    const daysSinceLastAction = (Date.now() - new Date(user.lastActionDate).getTime()) / (1000 * 3600 * 24);
    if (daysSinceLastAction >= 7) {
      user.ecoPoints = Math.max(0, user.ecoPoints - 10);
      user.lastActionDate = Date.now();
    }

    // 👇 ESTO ES LO QUE FALTABA: Recalcular el nivel siempre
    user.updateLevel();
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: true, message: error.message });
  }
});

module.exports = router;