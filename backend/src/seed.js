require('dotenv').config();
const User = require('./models/User');
const Product = require('./models/Product');
const Rental = require('./models/Rental');
const connectDB = require('./config/db');
const { defaultUsers, defaultProducts } = require('./utils/seedData');
const logger = require('./utils/logger');

const seedDatabase = async () => {
  try {
    await connectDB();
    logger.info('Purging old collections before seeding...');

    await User.deleteMany({});
    await Product.deleteMany({});
    await Rental.deleteMany({});

    logger.info('Inserting default user accounts...');
    // Create users individually to trigger password hashing pre-save hooks
    const createdUsers = [];
    for (const userData of defaultUsers) {
      const user = await User.create(userData);
      createdUsers.push(user);
    }
    logger.info(`Seeded ${createdUsers.length} users.`);

    logger.info('Inserting default electronic products...');
    const createdProducts = await Product.insertMany(defaultProducts);
    logger.info(`Seeded ${createdProducts.length} electronic products.`);

    // Find users by email
    const customer = createdUsers.find((u) => u.email === 'customer@example.com');
    const sarah = createdUsers.find((u) => u.email === 'sarah@example.com');
    const inventory = createdUsers.find((u) => u.email === 'inventory@example.com');

    // Pick products
    const dellLaptop = createdProducts.find((p) => p.name.includes('Dell'));
    const ps5 = createdProducts.find((p) => p.name.includes('PlayStation'));
    const canonCamera = createdProducts.find((p) => p.name.includes('Canon'));
    const sonySpeaker = createdProducts.find((p) => p.name.includes('Sony SRS'));
    const airpods = createdProducts.find((p) => p.name.includes('AirPods'));

    logger.info('Creating realistic sample rentals with diverse statuses...');

    const now = new Date();

    // 1. Confirmed / Active Rental (Customer)
    const activeStart = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const activeEnd = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    await Rental.create({
      user: customer._id,
      product: dellLaptop._id,
      startDate: activeStart,
      endDate: activeEnd,
      dueDate: activeEnd,
      totalDays: 7,
      pricePerDay: dellLaptop.pricePerDay,
      rentalCharge: dellLaptop.pricePerDay * 7,
      securityDeposit: dellLaptop.securityDeposit,
      lateDays: 0,
      lateFee: 0,
      totalAmount: dellLaptop.pricePerDay * 7 + dellLaptop.securityDeposit,
      bookingStatus: 'Confirmed',
      paymentStatus: 'Paid',
      dispatchDate: activeStart,
      returnStatus: 'Not Returned',
      productConditionBefore: 'Excellent',
      productConditionAfter: 'Pending',
      notes: 'Required for hackathon project presentation'
    });

    // 2. Dispatched Rental (Customer)
    const dispStart = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
    const dispEnd = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
    await Rental.create({
      user: customer._id,
      product: ps5._id,
      startDate: dispStart,
      endDate: dispEnd,
      dueDate: dispEnd,
      totalDays: 5,
      pricePerDay: ps5.pricePerDay,
      rentalCharge: ps5.pricePerDay * 5,
      securityDeposit: ps5.securityDeposit,
      lateDays: 0,
      lateFee: 0,
      totalAmount: ps5.pricePerDay * 5 + ps5.securityDeposit,
      bookingStatus: 'Dispatched',
      paymentStatus: 'Paid',
      dispatchDate: dispStart,
      returnStatus: 'Not Returned',
      productConditionBefore: 'Excellent',
      productConditionAfter: 'Pending',
      notes: 'Weekend gaming tournament'
    });

    // 3. Return Requested (Customer)
    const retReqStart = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000);
    const retReqEnd = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);
    await Rental.create({
      user: sarah._id,
      product: sonySpeaker._id,
      startDate: retReqStart,
      endDate: retReqEnd,
      dueDate: retReqEnd,
      totalDays: 5,
      pricePerDay: sonySpeaker.pricePerDay,
      rentalCharge: sonySpeaker.pricePerDay * 5,
      securityDeposit: sonySpeaker.securityDeposit,
      lateDays: 0,
      lateFee: 0,
      totalAmount: sonySpeaker.pricePerDay * 5 + sonySpeaker.securityDeposit,
      bookingStatus: 'Return Requested',
      paymentStatus: 'Paid',
      dispatchDate: retReqStart,
      returnStatus: 'Pending Inspection',
      productConditionBefore: 'Excellent',
      productConditionAfter: 'Pending',
      notes: 'Finished wedding event audio rental'
    });

    // 4. Overdue Rental (Auto-calculated late days & fee)
    const overdueStart = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
    const overdueDue = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const lateDays = 3;
    const lateFee = Math.round(lateDays * canonCamera.pricePerDay * 1.5);
    await Rental.create({
      user: customer._id,
      product: canonCamera._id,
      startDate: overdueStart,
      endDate: overdueDue,
      dueDate: overdueDue,
      totalDays: 7,
      pricePerDay: canonCamera.pricePerDay,
      rentalCharge: canonCamera.pricePerDay * 7,
      securityDeposit: canonCamera.securityDeposit,
      lateDays,
      lateFee,
      totalAmount: canonCamera.pricePerDay * 7 + canonCamera.securityDeposit + lateFee,
      bookingStatus: 'Overdue',
      paymentStatus: 'Paid',
      dispatchDate: overdueStart,
      returnStatus: 'Not Returned',
      productConditionBefore: 'Excellent',
      productConditionAfter: 'Pending',
      notes: 'Outdoor documentary filming'
    });

    // 5. Successfully Returned & Inspected Rental
    const pastStart = new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000);
    const pastEnd = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    await Rental.create({
      user: sarah._id,
      product: airpods._id,
      startDate: pastStart,
      endDate: pastEnd,
      dueDate: pastEnd,
      totalDays: 5,
      pricePerDay: airpods.pricePerDay,
      rentalCharge: airpods.pricePerDay * 5,
      securityDeposit: airpods.securityDeposit,
      lateDays: 0,
      lateFee: 0,
      totalAmount: airpods.pricePerDay * 5 + airpods.securityDeposit,
      bookingStatus: 'Returned',
      paymentStatus: 'Paid',
      dispatchDate: pastStart,
      returnDate: pastEnd,
      returnStatus: 'Accepted',
      productConditionBefore: 'Excellent',
      productConditionAfter: 'Excellent',
      inspectionNotes: 'All accessories and lightning charging cable intact. Audio test passed.',
      inspectedBy: inventory._id,
      notes: 'Business travel headphones'
    });

    logger.info('Database seeded successfully with Users, Products, and Rentals!');
    console.log('\n======================================================');
    console.log(' DEFAULT LOGIN CREDENTIALS (CHANGE IN PRODUCTION):');
    console.log(' Admin:              admin@example.com      / Password@123');
    console.log(' Inventory Manager:  inventory@example.com  / Password@123');
    console.log(' Customer:           customer@example.com   / Password@123');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    logger.error('Error during database seeding:', error);
    process.exit(1);
  }
};

seedDatabase();
