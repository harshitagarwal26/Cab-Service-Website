import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@cabservice.com' },
    update: {},
    create: {
      email: 'admin@cabservice.com',
      name: 'Admin User',
      hashedPassword: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdEKP1tHu1yjD5m', // password: admin123
      role: 'admin',
    },
  });

  // Clear existing data in the correct order (respecting foreign keys)
  console.log('Cleaning existing data...');
  await prisma.routePricing.deleteMany({});
  await prisma.booking.deleteMany({});
  await prisma.cityRoute.deleteMany({});
  await prisma.pricingRule.deleteMany({});
  await prisma.inquiry.deleteMany({});
  
  // Clear cab types and cities
  await prisma.cabType.deleteMany({});
  await prisma.city.deleteMany({});

  // Comprehensive list of Indian cities with airports
  const cities = [
    // Major Metropolitan Cities
    { name: 'Mumbai', state: 'Maharashtra', isAirport: false },
    { name: 'Mumbai Airport (BOM)', state: 'Maharashtra', isAirport: true },
    { name: 'Delhi', state: 'Delhi', isAirport: false },
    { name: 'Delhi Airport (DEL)', state: 'Delhi', isAirport: true },
    { name: 'Bengaluru', state: 'Karnataka', isAirport: false },
    { name: 'Bengaluru Airport (BLR)', state: 'Karnataka', isAirport: true },
    { name: 'Kolkata', state: 'West Bengal', isAirport: false },
    { name: 'Kolkata Airport (CCU)', state: 'West Bengal', isAirport: true },
    { name: 'Chennai', state: 'Tamil Nadu', isAirport: false },
    { name: 'Chennai Airport (MAA)', state: 'Tamil Nadu', isAirport: true },
    { name: 'Hyderabad', state: 'Telangana', isAirport: false },
    { name: 'Hyderabad Airport (HYD)', state: 'Telangana', isAirport: true },
    
    // Maharashtra
    { name: 'Pune', state: 'Maharashtra', isAirport: false },
    { name: 'Pune Airport (PNQ)', state: 'Maharashtra', isAirport: true },
    { name: 'Nagpur', state: 'Maharashtra', isAirport: false },
    { name: 'Nagpur Airport (NAG)', state: 'Maharashtra', isAirport: true },
    { name: 'Nashik', state: 'Maharashtra', isAirport: false },
    { name: 'Aurangabad', state: 'Maharashtra', isAirport: false },
    { name: 'Solapur', state: 'Maharashtra', isAirport: false },
    { name: 'Thane', state: 'Maharashtra', isAirport: false },
    { name: 'Navi Mumbai', state: 'Maharashtra', isAirport: false },
    
    // Karnataka
    { name: 'Mysuru', state: 'Karnataka', isAirport: false },
    { name: 'Hubli', state: 'Karnataka', isAirport: false },
    { name: 'Mangaluru', state: 'Karnataka', isAirport: false },
    { name: 'Mangaluru Airport (IXE)', state: 'Karnataka', isAirport: true },
    { name: 'Belagavi', state: 'Karnataka', isAirport: false },
    { name: 'Gulbarga', state: 'Karnataka', isAirport: false },
    
    // Tamil Nadu
    { name: 'Coimbatore', state: 'Tamil Nadu', isAirport: false },
    { name: 'Coimbatore Airport (CJB)', state: 'Tamil Nadu', isAirport: true },
    { name: 'Madurai', state: 'Tamil Nadu', isAirport: false },
    { name: 'Madurai Airport (IXM)', state: 'Tamil Nadu', isAirport: true },
    { name: 'Tiruchirappalli', state: 'Tamil Nadu', isAirport: false },
    { name: 'Tiruchirappalli Airport (TRZ)', state: 'Tamil Nadu', isAirport: true },
    { name: 'Salem', state: 'Tamil Nadu', isAirport: false },
    { name: 'Tirunelveli', state: 'Tamil Nadu', isAirport: false },
    { name: 'Erode', state: 'Tamil Nadu', isAirport: false },
    { name: 'Vellore', state: 'Tamil Nadu', isAirport: false },
    { name: 'Thoothukudi', state: 'Tamil Nadu', isAirport: false },
    
    // Gujarat
    { name: 'Ahmedabad', state: 'Gujarat', isAirport: false },
    { name: 'Ahmedabad Airport (AMD)', state: 'Gujarat', isAirport: true },
    { name: 'Surat', state: 'Gujarat', isAirport: false },
    { name: 'Vadodara', state: 'Gujarat', isAirport: false },
    { name: 'Vadodara Airport (BDQ)', state: 'Gujarat', isAirport: true },
    { name: 'Rajkot', state: 'Gujarat', isAirport: false },
    { name: 'Bhavnagar', state: 'Gujarat', isAirport: false },
    { name: 'Jamnagar', state: 'Gujarat', isAirport: false },
    
    // Rajasthan
    { name: 'Jaipur', state: 'Rajasthan', isAirport: false },
    { name: 'Jaipur Airport (JAI)', state: 'Rajasthan', isAirport: true },
    { name: 'Jodhpur', state: 'Rajasthan', isAirport: false },
    { name: 'Jodhpur Airport (JDH)', state: 'Rajasthan', isAirport: true },
    { name: 'Udaipur', state: 'Rajasthan', isAirport: false },
    { name: 'Udaipur Airport (UDR)', state: 'Rajasthan', isAirport: true },
    { name: 'Kota', state: 'Rajasthan', isAirport: false },
    { name: 'Bikaner', state: 'Rajasthan', isAirport: false },
    { name: 'Ajmer', state: 'Rajasthan', isAirport: false },
    
    // Uttar Pradesh
    { name: 'Lucknow', state: 'Uttar Pradesh', isAirport: false },
    { name: 'Lucknow Airport (LKO)', state: 'Uttar Pradesh', isAirport: true },
    { name: 'Kanpur', state: 'Uttar Pradesh', isAirport: false },
    { name: 'Agra', state: 'Uttar Pradesh', isAirport: false },
    { name: 'Varanasi', state: 'Uttar Pradesh', isAirport: false },
    { name: 'Varanasi Airport (VNS)', state: 'Uttar Pradesh', isAirport: true },
    { name: 'Allahabad', state: 'Uttar Pradesh', isAirport: false },
    { name: 'Meerut', state: 'Uttar Pradesh', isAirport: false },
    { name: 'Ghaziabad', state: 'Uttar Pradesh', isAirport: false },
    { name: 'Noida', state: 'Uttar Pradesh', isAirport: false },
    { name: 'Bareilly', state: 'Uttar Pradesh', isAirport: false },
    { name: 'Gorakhpur', state: 'Uttar Pradesh', isAirport: false },
    
    // Madhya Pradesh
    { name: 'Indore', state: 'Madhya Pradesh', isAirport: false },
    { name: 'Indore Airport (IDR)', state: 'Madhya Pradesh', isAirport: true },
    { name: 'Bhopal', state: 'Madhya Pradesh', isAirport: false },
    { name: 'Bhopal Airport (BHO)', state: 'Madhya Pradesh', isAirport: true },
    { name: 'Jabalpur', state: 'Madhya Pradesh', isAirport: false },
    { name: 'Gwalior', state: 'Madhya Pradesh', isAirport: false },
    { name: 'Ujjain', state: 'Madhya Pradesh', isAirport: false },
    
    // West Bengal
    { name: 'Howrah', state: 'West Bengal', isAirport: false },
    { name: 'Durgapur', state: 'West Bengal', isAirport: false },
    { name: 'Asansol', state: 'West Bengal', isAirport: false },
    { name: 'Siliguri', state: 'West Bengal', isAirport: false },
    { name: 'Bagdogra Airport (IXB)', state: 'West Bengal', isAirport: true },
    
    // Kerala
    { name: 'Kochi', state: 'Kerala', isAirport: false },
    { name: 'Kochi Airport (COK)', state: 'Kerala', isAirport: true },
    { name: 'Thiruvananthapuram', state: 'Kerala', isAirport: false },
    { name: 'Thiruvananthapuram Airport (TRV)', state: 'Kerala', isAirport: true },
    { name: 'Kozhikode', state: 'Kerala', isAirport: false },
    { name: 'Kozhikode Airport (CCJ)', state: 'Kerala', isAirport: true },
    { name: 'Thrissur', state: 'Kerala', isAirport: false },
    { name: 'Kollam', state: 'Kerala', isAirport: false },
    { name: 'Kannur', state: 'Kerala', isAirport: false },
    
    // Andhra Pradesh
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', isAirport: false },
    { name: 'Visakhapatnam Airport (VTZ)', state: 'Andhra Pradesh', isAirport: true },
    { name: 'Vijayawada', state: 'Andhra Pradesh', isAirport: false },
    { name: 'Guntur', state: 'Andhra Pradesh', isAirport: false },
    { name: 'Nellore', state: 'Andhra Pradesh', isAirport: false },
    { name: 'Kurnool', state: 'Andhra Pradesh', isAirport: false },
    { name: 'Kakinada', state: 'Andhra Pradesh', isAirport: false },
    { name: 'Rajahmundry', state: 'Andhra Pradesh', isAirport: false },
    { name: 'Tirupati', state: 'Andhra Pradesh', isAirport: false },
    { name: 'Tirupati Airport (TIR)', state: 'Andhra Pradesh', isAirport: true },
    
    // Other States
    { name: 'Chandigarh', state: 'Chandigarh', isAirport: false },
    { name: 'Chandigarh Airport (IXC)', state: 'Chandigarh', isAirport: true },
    { name: 'Bhubaneswar', state: 'Odisha', isAirport: false },
    { name: 'Bhubaneswar Airport (BBI)', state: 'Odisha', isAirport: true },
    { name: 'Patna', state: 'Bihar', isAirport: false },
    { name: 'Patna Airport (PAT)', state: 'Bihar', isAirport: true },
    { name: 'Ranchi', state: 'Jharkhand', isAirport: false },
    { name: 'Ranchi Airport (IXR)', state: 'Jharkhand', isAirport: true },
    { name: 'Guwahati', state: 'Assam', isAirport: false },
    { name: 'Guwahati Airport (GAU)', state: 'Assam', isAirport: true },
    { name: 'Dehradun', state: 'Uttarakhand', isAirport: false },
    { name: 'Dehradun Airport (DED)', state: 'Uttarakhand', isAirport: true },
    { name: 'Shimla', state: 'Himachal Pradesh', isAirport: false },
    { name: 'Jammu', state: 'Jammu and Kashmir', isAirport: false },
    { name: 'Jammu Airport (IXJ)', state: 'Jammu and Kashmir', isAirport: true },
    { name: 'Srinagar', state: 'Jammu and Kashmir', isAirport: false },
    { name: 'Srinagar Airport (SXR)', state: 'Jammu and Kashmir', isAirport: true },
  ];

  console.log('Creating cities...');
  const createdCities = [];
  for (const cityData of cities) {
    const city = await prisma.city.create({
      data: cityData,
    });
    createdCities.push(city);
  }

  console.log('Creating cab types...');
  // Create cab types with the new categories
  const cabTypes = [
    {
      name: 'Hatchback',
      seats: 4,
      luggage: 1,
      features: '["AC", "GPS"]',
    },
    {
      name: 'Sedan',
      seats: 4,
      luggage: 2,
      features: '["AC", "GPS", "Music System"]',
    },
    {
      name: 'SUV',
      seats: 6,
      luggage: 4,
      features: '["AC", "GPS", "Music System", "Extra Space"]',
    },
    {
      name: 'Prime SUV',
      seats: 6,
      luggage: 4,
      features: '["AC", "GPS", "Premium Interior", "Extra Space", "Leather Seats"]',
    },
    {
      name: 'Custom',
      seats: 0, // Variable
      luggage: 0, // Variable
      features: '["Customizable"]',
    },
  ];

  const createdCabTypes = [];
  for (const cabTypeData of cabTypes) {
    const cabType = await prisma.cabType.create({
      data: cabTypeData,
    });
    createdCabTypes.push(cabType);
  }

  console.log('Creating sample routes and pricing...');
  // Create some popular city routes with sample pricing (admin can modify these)
  const sampleRoutes = [
    { 
      fromName: 'Mumbai', 
      toName: 'Pune', 
      distance: 150, 
      duration: 180,
      prices: { 'Hatchback': 1500, 'Sedan': 1800, 'SUV': 2250, 'Prime SUV': 2700 }
    },
    { 
      fromName: 'Pune', 
      toName: 'Mumbai', 
      distance: 150, 
      duration: 180,
      prices: { 'Hatchback': 1500, 'Sedan': 1800, 'SUV': 2250, 'Prime SUV': 2700 }
    },
    { 
      fromName: 'Delhi', 
      toName: 'Agra', 
      distance: 230, 
      duration: 240,
      prices: { 'Hatchback': 2300, 'Sedan': 2760, 'SUV': 3450, 'Prime SUV': 4140 }
    },
    { 
      fromName: 'Agra', 
      toName: 'Delhi', 
      distance: 230, 
      duration: 240,
      prices: { 'Hatchback': 2300, 'Sedan': 2760, 'SUV': 3450, 'Prime SUV': 4140 }
    },
    { 
      fromName: 'Bengaluru', 
      toName: 'Mysuru', 
      distance: 150, 
      duration: 180,
      prices: { 'Hatchback': 1500, 'Sedan': 1800, 'SUV': 2250, 'Prime SUV': 2700 }
    },
    { 
      fromName: 'Mysuru', 
      toName: 'Bengaluru', 
      distance: 150, 
      duration: 180,
      prices: { 'Hatchback': 1500, 'Sedan': 1800, 'SUV': 2250, 'Prime SUV': 2700 }
    },
    // Airport routes
    { 
      fromName: 'Mumbai', 
      toName: 'Mumbai Airport (BOM)', 
      distance: 25, 
      duration: 45,
      prices: { 'Hatchback': 400, 'Sedan': 500, 'SUV': 650, 'Prime SUV': 800 }
    },
    { 
      fromName: 'Mumbai Airport (BOM)', 
      toName: 'Mumbai', 
      distance: 25, 
      duration: 45,
      prices: { 'Hatchback': 400, 'Sedan': 500, 'SUV': 650, 'Prime SUV': 800 }
    },
    { 
      fromName: 'Delhi', 
      toName: 'Delhi Airport (DEL)', 
      distance: 20, 
      duration: 40,
      prices: { 'Hatchback': 350, 'Sedan': 450, 'SUV': 600, 'Prime SUV': 750 }
    },
    { 
      fromName: 'Delhi Airport (DEL)', 
      toName: 'Delhi', 
      distance: 20, 
      duration: 40,
      prices: { 'Hatchback': 350, 'Sedan': 450, 'SUV': 600, 'Prime SUV': 750 }
    },
  ];

  for (const routeData of sampleRoutes) {
    const fromCity = createdCities.find(c => c.name === routeData.fromName);
    const toCity = createdCities.find(c => c.name === routeData.toName);
    
    if (fromCity && toCity) {
      // Create route
      const route = await prisma.cityRoute.create({
        data: {
          fromCityId: fromCity.id,
          toCityId: toCity.id,
          distanceKm: routeData.distance,
          durationMin: routeData.duration,
          tripTypes: '["ONE_WAY", "ROUND_TRIP"]',
        },
      });

      // Create route-specific pricing for each non-custom cab type
      const nonCustomCabTypes = createdCabTypes.filter(ct => ct.name !== 'Custom');
      for (const cabType of nonCustomCabTypes) {
        if (routeData.prices[cabType.name as keyof typeof routeData.prices]) {
          const oneWayPrice = routeData.prices[cabType.name as keyof typeof routeData.prices];
          
          const tripTypes = ['ONE_WAY', 'ROUND_TRIP'];
          for (const tripType of tripTypes) {
            await prisma.routePricing.create({
              data: {
                routeId: route.id,
                fromCityId: fromCity.id,
                toCityId: toCity.id,
                cabTypeId: cabType.id,
                tripType: tripType,
                price: tripType === 'ROUND_TRIP' ? Math.round(oneWayPrice * 1.8) : oneWayPrice,
              },
            });
          }
        }
      }
    }
  }

  console.log('Creating default pricing rules...');
  // Create default pricing rules for general cases (fallback pricing when no route-specific pricing exists)
  const tripTypes = ['ONE_WAY', 'ROUND_TRIP', 'LOCAL', 'AIRPORT'];
  for (const cabType of createdCabTypes) {
    if (cabType.name !== 'Custom') {
      for (const tripType of tripTypes) {
        const baseFare = cabType.name === 'Prime SUV' ? 800 : 
                        cabType.name === 'SUV' ? 600 : 
                        cabType.name === 'Sedan' ? 400 : 300; // Hatchback
        
        const perKm = cabType.name === 'Prime SUV' ? 18 : 
                     cabType.name === 'SUV' ? 15 : 
                     cabType.name === 'Sedan' ? 12 : 10; // Hatchback

        await prisma.pricingRule.create({
          data: {
            cabTypeId: cabType.id,
            tripType: tripType,
            baseFare: baseFare,
            perKm: perKm,
            perMinute: 3,
            minKmPerDay: tripType === 'LOCAL' ? 80 : 0,
          },
        });
      }
    }
  }

  console.log(`Database seeded successfully!`);
  console.log(`Created ${createdCities.length} cities and ${createdCabTypes.length} cab types`);
  console.log(`Created ${sampleRoutes.length} sample routes with pricing`);
  console.log('Admin can now manage all pricing through the admin panel at /pricing');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });