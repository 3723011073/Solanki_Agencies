const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const CATALOG_CLEAN = path.join(ROOT, 'images', 'catalog_clean');

const platoImages = [];
const dinewellImages = [];

if (fs.existsSync(path.join(CATALOG_CLEAN, 'plato_v2'))) {
  const files = fs.readdirSync(path.join(CATALOG_CLEAN, 'plato_v2'));
  platoImages.push(...files.sort());
}

if (fs.existsSync(path.join(CATALOG_CLEAN, 'dinewell_v2'))) {
  const files = fs.readdirSync(path.join(CATALOG_CLEAN, 'dinewell_v2'));
  dinewellImages.push(...files.sort());
}

const products = [];
let productId = 1;

const platoNames = [
  'Coupe Plate Small - Fine Porcelain',
  'Coupe Plate Medium - Fine Porcelain',
  'Coupe Plate Large - Fine Porcelain',
  'Edge Plate Small - Fine Porcelain',
  'Edge Dinner Plate - Fine Porcelain',
  'Soup Plate - Fine Porcelain',
  'Chatni Katori - Fine Porcelain',
  'Katori - Fine Porcelain',
  'Shambhar Bowl - Fine Porcelain',
  'Hotel Soup Bowl Small - Fine Porcelain',
  'Footed Bowl Mini - Fine Porcelain',
  'Footed Bowl Small - Fine Porcelain',
  'Union Saucer - Fine Porcelain',
  'Tea Cup Big - Fine Porcelain',
  'Barista Cup - Fine Porcelain',
  'Barrel Mug - Fine Porcelain',
  'Goa Platter Small - Fine Porcelain',
  'Goa Platter Large - Fine Porcelain',
  'Vital Platter Small - Fine Porcelain',
  'Vital Platter Large - Fine Porcelain',
  'Rectangular Platter Small - Fine Porcelain',
  'Rectangular Platter Large - Fine Porcelain'
];

const platoDescs = [
  'Premium Plato fine porcelain coupe plate in classic small size for elegant dining',
  'Premium Plato fine porcelain coupe plate in elegant medium size for formal service',
  'Premium Plato fine porcelain coupe plate in sophisticated large size for fine dining',
  'Premium Plato fine porcelain edge plate in small size with contemporary design',
  'Premium Plato fine porcelain edge dinner plate for formal dining occasions',
  'Premium Plato fine porcelain soup plate with graceful rim and elegant design',
  'Premium Plato fine porcelain chatni katori for condiments and dips',
  'Premium Plato fine porcelain katori for serving rice and side dishes',
  'Premium Plato fine porcelain shambhar bowl for appetizers and snacks',
  'Premium Plato fine porcelain hotel soup bowl in small size for restaurants',
  'Premium Plato fine porcelain footed bowl in mini size for special occasions',
  'Premium Plato fine porcelain footed bowl in small size with pedestal base',
  'Premium Plato fine porcelain union saucer for tea and coffee service',
  'Premium Plato fine porcelain tea cup in generous size for comfortable drinking',
  'Premium Plato fine porcelain barista coffee cup for specialty beverages',
  'Premium Plato fine porcelain barrel mug for coffee, tea, and hot beverages',
  'Premium Plato fine porcelain Goa platter in small size for buffet service',
  'Premium Plato fine porcelain Goa platter in large size for elegant table display',
  'Premium Plato fine porcelain Vital platter in small size for centerpiece display',
  'Premium Plato fine porcelain Vital platter in large size for grand presentation',
  'Premium Plato fine porcelain rectangular platter in small size for service',
  'Premium Plato fine porcelain rectangular platter in large size for centerpiece'
];

const platoPrices = [345, 595, 665, 575, 1095, 795, 125, 165, 215, 255, 295, 450, 205, 280, 345, 345, 785, 1075, 675, 975, 825, 995];

for (let i = 0; i < platoImages.length; i++) {
  products.push({
    id: productId++,
    name: platoNames[i % platoNames.length],
    category: i < 16 ? 'Crockery & Dinnerware' : 'Buffet & Display Ware',
    desc: platoDescs[i % platoDescs.length],
    price: platoPrices[i % platoPrices.length],
    stock: 24 + (i * 7) % 72,
    image: `/images/catalog_clean/plato_v2/${platoImages[i]}`
  });
}

const dinewellNames = [
  'Dinewell Coupe Plate Extra Large',
  'Dinewell Coupe Plate Large',
  'Dinewell Coupe Plate Medium',
  'Dinewell Coupe Plate Small',
  'Dinewell Georgian Plate Extra Large',
  'Dinewell Georgian Plate Large',
  'Dinewell Georgian Plate Small'
];

const dinewellDescs = [
  'Premium Dinewell porcelain coupe plate extra large for elegant fine dining',
  'Premium Dinewell porcelain coupe plate large for formal table service',
  'Premium Dinewell porcelain coupe plate medium for everyday sophisticated dining',
  'Premium Dinewell porcelain coupe plate small for appetizers and special courses',
  'Premium Dinewell porcelain Georgian plate extra large for buffet presentation',
  'Premium Dinewell porcelain Georgian plate large for fine dining service',
  'Premium Dinewell porcelain Georgian plate small for specialty dining occasion'
];

const dinewellPrices = [415, 390, 365, 195, 405, 375, 215];

for (let i = 0; i < dinewellImages.length; i++) {
  products.push({
    id: productId++,
    name: dinewellNames[i % dinewellNames.length],
    category: 'Crockery & Dinnerware',
    desc: dinewellDescs[i % dinewellDescs.length],
    price: dinewellPrices[i % dinewellPrices.length],
    stock: 24 + (i * 5) % 60,
    image: `/images/catalog_clean/dinewell_v2/${dinewellImages[i]}`
  });
}

fs.writeFileSync(path.join(ROOT, 'products.json'), JSON.stringify(products, null, 2));

console.log(`Rebuilt products.json with ${products.length} products`);
console.log(`  - Plato: ${platoImages.length} products`);
console.log(`  - Dinewell: ${dinewellImages.length} products`);
