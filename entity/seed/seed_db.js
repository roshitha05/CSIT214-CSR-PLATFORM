import { sql } from 'drizzle-orm';
import { usersTable, userProfilesTable } from './tables.js';
import { users } from './seeds.js';
import DB from '../db.js';

const getEmail = (name) => `${name.replace(' ', '_')}@CSR.com`;
const getPassword = (name) => name.replace(' ', '');
const getPhoneNumber = () => {
    let number = '';
    for (let i = 0; i < 7; i++)
        number += Math.floor(Math.random() * 10).toString();
    return '9' + number;
};
const getDOB = () => {
    const start = new Date(1950, 0, 1);
    const end = new Date(2005, 11, 31);
    const randomDate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    randomDate.setHours(0, 0, 0, 0);

    return randomDate;
};

async function main(tx) {
    // truncate all the tables
    console.log('Truncating all tables...');

    await tx.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
    await tx.execute(
        sql`TRUNCATE TABLE user_profiles RESTART IDENTITY CASCADE`
    );

    // seed user_profiles
    console.log('Seeding user profiles...');

    const [user_admin] = await tx
        .insert(userProfilesTable)
        .values({
            name: 'User Admin',
            description: `System moderator managing user accounts and platform integrity...`,
        })
        .returning();

    const [pin] = await tx
        .insert(userProfilesTable)
        .values({
            name: 'Person-In-Need',
            description: `Individual requesting volunteer assistance...`,
        })
        .returning();

    const [csr] = await tx
        .insert(userProfilesTable)
        .values({
            name: 'CSR Representative',
            description: `Corporate liaison coordinating volunteer programs...`,
        })
        .returning();

    const [platform_management] = await tx
        .insert(userProfilesTable)
        .values({
            name: 'Platform Management',
            description: `System administrator overseeing platform operations...`,
        })
        .returning();

    // seed users
    console.log('Seeding users...');

    for (const user of users) {
        const random = Math.random() * 100;

        let profile = pin;
        if (random < 5) profile = user_admin;
        else if (random < 10) profile = platform_management;
        else if (random < 30) profile = csr;

        await tx.insert(usersTable).values({
            email: getEmail(user),
            username: user,
            password: getPassword(user),
            phone_number: getPhoneNumber(),
            address: `Lorem ipsum dolor sit amet...`,
            date_of_birth: getDOB(),
            status: 'ACTIVE',
            user_profile: profile.name,
        });
    }

    console.log('Committing changes...');
}

const { db } = new DB();

await db.transaction(async (tx) => {
    await main(tx);
});
