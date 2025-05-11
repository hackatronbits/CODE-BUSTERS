const mongoose = require('mongoose');

const mechanicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  }
});




const MechanicSchema = new mongoose.Schema({
  name: String,
  shopName: String,
  email: String,
  password: String, 
  phone: String,
  address: String,
  services: String,
  hours: String,
  shopPhoto: String,
  photoFront: String,
  photoLeft: String,
  photoRight: String,
  location: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true }
  }
}, {collection:'mechanic2'});








// Important: for location-based queries
mechanicSchema.index({ location: '2dsphere' });

module.exports = {
  mechanic: mongoose.model('mechanic', mechanicSchema), // Use 'Mechanic' as the model name
  mechanic2: mongoose.model('Mechanic2', MechanicSchema)

};
