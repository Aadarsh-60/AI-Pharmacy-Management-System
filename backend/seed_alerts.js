import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Inventory from './models/Inventory.js';
import User from './models/User.js';

dotenv.config({ path: './config/.env' });

const seedAlerts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Connected to MongoDB');

        // Get a user to assign the inventory items to
        const user = await User.findOne();
        if (!user) {
            console.error('No user found! Cannot seed without an email address.');
            process.exit(1);
        }
        const email = user.email;

        // Seed 2 low stock items
        await Inventory.create([
            {
                email: email,
                itemName: 'Paracetamol 500mg',
                batch: 'BATCH-LOW1',
                partyName: 'PharmaCorp',
                quantity: 5,
                purchaseRate: 2,
                mrp: 10,
                expiryDate: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000), // 100 days (Not expiring)
                category: 'Painkillers',
                tags: ['fever', 'pain']
            },
            {
                email: email,
                itemName: 'Amoxicillin 250mg',
                batch: 'BATCH-LOW2',
                partyName: 'MediHealth Inc',
                quantity: 2,
                purchaseRate: 5,
                mrp: 20,
                expiryDate: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000), // 200 days
                category: 'Antibiotics',
                tags: ['infection']
            }
        ]);

        // Seed 2 expiring soon items
        await Inventory.create([
            {
                email: email,
                itemName: 'Vitamin C Tablets',
                batch: 'BATCH-EXP1',
                partyName: 'HealthPlus',
                quantity: 50,
                purchaseRate: 1,
                mrp: 5,
                expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
                category: 'Vitamins',
                tags: ['immunity']
            },
            {
                email: email,
                itemName: 'Cough Syrup',
                batch: 'BATCH-EXP2',
                partyName: 'LiquidMeds',
                quantity: 30,
                purchaseRate: 15,
                mrp: 50,
                expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
                category: 'Cold & Cough',
                tags: ['syrup']
            }
        ]);

        console.log(`Successfully seeded inventory alerts for user ${email}`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding alerts:', error);
        process.exit(1);
    }
};

seedAlerts();
