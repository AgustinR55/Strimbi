const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  ecoPoints: { type: Number, default: 0 },
  level: { type: String, default: 'Semilla' },
  lastActionDate: { type: Date, default: Date.now }
});

// Lógica para calcular el nivel según las reglas
userSchema.methods.updateLevel = function() {
  if (this.ecoPoints >= 1000) this.level = 'Bosque';
  else if (this.ecoPoints >= 500) this.level = 'Árbol';
  else if (this.ecoPoints >= 100) this.level = 'Brote';
  else this.level = 'Semilla';
};

module.exports = mongoose.model('User', userSchema);