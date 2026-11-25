const cron = require('node-cron');
const User = require('../models/User');

// Se ejecuta todos los días a las 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('🤖 Ejecutando cron job de penalización por inactividad...');
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  
  try {
    // Buscar usuarios cuya última acción fue hace más de 7 días
    const inactiveUsers = await User.find({ lastActionDate: { $lt: sevenDaysAgo } });
    
    for (let user of inactiveUsers) {
      user.ecoPoints = Math.max(0, user.ecoPoints - 10);
      user.lastActionDate = Date.now(); // Reseteamos la fecha para no quitarle 10 puntos todos los días
      user.updateLevel();
      await user.save();
    }
    console.log(`✅ Se penalizaron ${inactiveUsers.length} usuarios inactivos.`);
  } catch (error) {
    console.error('Error en el cron job:', error);
  }
});