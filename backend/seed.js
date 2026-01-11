const bcrypt = require('bcrypt');
const { db } = require('./config/database');

async function seedDatabase() {
  try {
    const adminPassword = await bcrypt.hash('Admin@123', 10);
    const ownerPassword = await bcrypt.hash('Owner@123', 10);
    const userPassword = await bcrypt.hash('User@123', 10);

    db.run(
      'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Administrator Test Account', 'admin@test.com', adminPassword, '123 Admin Street, City, State', 'admin'],
      function(err) {
        if (err) console.log('Admin already exists or error:', err.message);
        else console.log('✓ Admin user created successfully');
      }
    );

    db.run(
      'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Store Owner Test Account', 'owner@test.com', ownerPassword, '456 Owner Avenue, City, State', 'owner'],
      function(err) {
        if (err) console.log('Owner already exists or error:', err.message);
        else {
          console.log('✓ Owner user created successfully');
          const ownerId = this.lastID;
          
          db.run(
            'INSERT INTO Stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)',
            ['Amazing Electronics Store and Gadgets Shop', 'store@test.com', '789 Store Boulevard, Shopping District', ownerId],
            function(err) {
              if (err) console.log('Store already exists or error:', err.message);
              else console.log('✓ Store created for owner successfully');
            }
          );
        }
      }
    );

    db.run(
      'INSERT INTO Users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)',
      ['Regular User Test Account', 'user@test.com', userPassword, '789 User Road, City, State', 'user'],
      function(err) {
        if (err) console.log('User already exists or error:', err.message);
        else console.log('✓ Regular user created successfully');
      }
    );

    setTimeout(() => {
      console.log('\n========================================');
      console.log('DATABASE SEEDING COMPLETE!');
      console.log('========================================');
      console.log('\nYou can now login with these credentials:');
      console.log('');
      console.log('👤 ADMIN:');
      console.log('   Email: admin@test.com');
      console.log('   Password: Admin@123');
      console.log('');
      console.log('🏪 STORE OWNER:');
      console.log('   Email: owner@test.com');
      console.log('   Password: Owner@123');
      console.log('');
      console.log('👥 REGULAR USER:');
      console.log('   Email: user@test.com');
      console.log('   Password: User@123');
      console.log('========================================\n');
      process.exit(0);
    }, 2000);

  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

setTimeout(() => {
  seedDatabase();
}, 1000);
