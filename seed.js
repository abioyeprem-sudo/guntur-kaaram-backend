// Run once after connecting your database: node seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const MenuItem = require('./models/MenuItem');

const items = [
  { name: "Guntur Mirchi Bajji", veg: true, heat: 3, price: 60, desc: "Stuffed green chilli fritters, tamarind chutney", emoji: "🌶️" },
  { name: "Kodi Kura (Chicken Curry)", veg: false, heat: 3, price: 220, desc: "Home-style Guntur chicken curry, extra spicy", emoji: "🍛" },
  { name: "Gongura Mutton", veg: false, heat: 2, price: 280, desc: "Tangy sorrel-leaf mutton curry", emoji: "🥘" },
  { name: "Pesarattu with Upma", veg: true, heat: 1, price: 90, desc: "Green gram dosa, ginger chutney", emoji: "🫓" },
  { name: "Guntur Chicken 65", veg: false, heat: 3, price: 190, desc: "Deep fried, curry leaf tempered", emoji: "🍗" },
  { name: "Ulavacharu Biryani", veg: false, heat: 2, price: 250, desc: "Horsegram-infused slow biryani", emoji: "🍚" }
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await MenuItem.deleteMany({});
  await MenuItem.insertMany(items);
  console.log(`Seeded ${items.length} menu items`);
  process.exit(0);
});
