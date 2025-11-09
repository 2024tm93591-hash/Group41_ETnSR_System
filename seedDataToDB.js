const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Sequelize, DataTypes } = require('sequelize');

// Function to create a Sequelize instance for a specific database
function createSequelizeInstance(databaseName) {
  // Map database names to their corresponding ports
  const portMap = {
    'user_db': 1437,
    'catalog_db': 1433,
    'seating_db': 1434,
    'order_db': 1435,
    'payment_db': 1436
  };

  const port = portMap[databaseName] || 1433;

  return new Sequelize(databaseName, 'sa', 'StrongP@ssw0rd!', {
    host: 'localhost',
    dialect: 'mssql',
    port: port,
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true,
      },
    },
    logging: false, // set to console.log if you want detailed SQL logs
  });
}

// ✅ Promise-based CSV reader + table inserter
async function seedTable(databaseName, tableName, filePath, columns) {
  try {
    const sequelize = createSequelizeInstance(databaseName);

    // Define a dynamic model for the table
    const Table = sequelize.define(tableName, columns, {
      tableName,
      timestamps: false,
    });

    // Drop and recreate the table
    await Table.sync({ force: true });
    console.log(`✅ Table "${tableName}" created in database "${databaseName}"`);

    // Read CSV and insert data (awaited properly)
    await new Promise((resolve, reject) => {
      const rows = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', async () => {
          console.log(`📄 "${filePath}" loaded with ${rows.length} rows`);

          try {
            let inserted = 0;
            for (const row of rows) {
              // Skip empty or invalid rows
              if (Object.values(row).some((v) => v === undefined || v === null || v === '')) {
                console.warn(`⚠️ Skipped invalid row in "${tableName}":`, row);
                continue;
              }

              // Remove auto-increment columns from the row data
              const cleanRow = { ...row };
              Object.keys(columns).forEach(columnName => {
                if (columns[columnName].autoIncrement) {
                  delete cleanRow[columnName];
                }
              });

              await Table.create(cleanRow);
              inserted++;
            }

            console.log(`✅ Inserted ${inserted}/${rows.length} rows into "${tableName}"`);
            resolve();
          } catch (insertErr) {
            console.error(`❌ Error inserting into "${tableName}":`, insertErr);
            reject(insertErr);
          }
        })
        .on('error', (err) => {
          console.error(`❌ Failed to read "${filePath}":`, err);
          reject(err);
        });
    });

    await sequelize.close();
  } catch (err) {
    console.error(`❌ Failed to seed table "${tableName}" in database "${databaseName}":`, err);
  }
}

// ✅ Main function
async function seedAll() {
  try {
    const seedFiles = [
      {
        databaseName: 'catalog_db',
        tableName: 'Events',
        filePath: path.join(__dirname, 'seed-data', 'etsr_events.csv'),
        columns: {
          event_id: { type: DataTypes.INTEGER, primaryKey: true },
          venue_id: { type: DataTypes.INTEGER },
          title: { type: DataTypes.STRING },
          event_type: { type: DataTypes.STRING },
          event_date: { type: DataTypes.DATE },
          base_price: { type: DataTypes.FLOAT },
          status: { type: DataTypes.STRING },
        },
      },
      {
        databaseName: 'order_db',
        tableName: 'Orders',
        filePath: path.join(__dirname, 'seed-data', 'etsr_orders.csv'),
        columns: {
          order_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
          user_id: { type: DataTypes.INTEGER },
          event_id: { type: DataTypes.INTEGER },
          status: { type: DataTypes.STRING },
          payment_status: { type: DataTypes.STRING },
          order_total: { type: DataTypes.FLOAT },
          created_at: { type: DataTypes.DATE },
        },
      },
      {
        databaseName: 'payment_db',
        tableName: 'Payments',
        filePath: path.join(__dirname, 'seed-data', 'etsr_payments.csv'),
        columns: {
          payment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
          order_id: { type: DataTypes.INTEGER },
          amount: { type: DataTypes.FLOAT },
          method: { type: DataTypes.STRING },
          status: { type: DataTypes.STRING },
          reference: { type: DataTypes.STRING },
          created_at: { type: DataTypes.DATE },
        },
      },
      {
        databaseName: 'seating_db',
        tableName: 'Seats',
        filePath: path.join(__dirname, 'seed-data', 'etsr_seats.csv'),
        columns: {
          seat_id: { type: DataTypes.INTEGER, primaryKey: true },
          event_id: { type: DataTypes.INTEGER },
          section: { type: DataTypes.STRING },
          row: { type: DataTypes.STRING },
          seat_number: { type: DataTypes.STRING },
          price: { type: DataTypes.FLOAT },
        },
      },
      {
        databaseName: 'order_db',
        tableName: 'Tickets',
        filePath: path.join(__dirname, 'seed-data', 'etsr_tickets.csv'),
        columns: {
          ticket_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
          order_id: { type: DataTypes.INTEGER },
          event_id: { type: DataTypes.INTEGER },
          seat_id: { type: DataTypes.INTEGER },
          price_paid: { type: DataTypes.FLOAT },
        },
      },
      {
        databaseName: 'catalog_db',
        tableName: 'Venues',
        filePath: path.join(__dirname, 'seed-data', 'etsr_venues.csv'),
        columns: {
          venue_id: { type: DataTypes.INTEGER, primaryKey: true },
          name: { type: DataTypes.STRING },
          city: { type: DataTypes.STRING },
          capacity: { type: DataTypes.INTEGER },
        },
      },
      {
        databaseName: 'user_db',
        tableName: 'Users',
        filePath: path.join(__dirname, 'seed-data', 'etsr_users.csv'),
        columns: {
          user_id: { type: DataTypes.INTEGER, primaryKey: true },
          name: { type: DataTypes.STRING },
          email: { type: DataTypes.STRING },
          phone: { type: DataTypes.STRING },
          created_at: { type: DataTypes.DATE },
        },
      },
    ];

    let tablesSeeded = 0;

    for (const { databaseName, tableName, filePath, columns } of seedFiles) {
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ Missing file: ${filePath}`);
        continue;
      }
      await seedTable(databaseName, tableName, filePath, columns);
      tablesSeeded++;
    }

    console.log(`\n🎉 Seeding complete: ${tablesSeeded}/${seedFiles.length} tables seeded successfully.`);
  } catch (err) {
    console.error('❌ Seeding process failed:', err);
  }
}

// Run seeding
seedAll();
