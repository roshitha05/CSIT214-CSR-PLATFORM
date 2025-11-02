import { eq, sql } from 'drizzle-orm';
import { usersTable, userProfilesTable, categoriesTable, serviceRequestsTable, shortlistsTable, matchesTable } from '../database/tables.js';
import { users, categories, serviceRequests } from './seeds.js';
import DB from '../database/db.js';
import ShortlistsEntity from '../entity/shortlists.js';

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
const randomDate = () => {
    const end = new Date();
    const start = new Date(end);
    start.setMonth(end.getMonth() - 1);

    const randomDate = new Date(
        start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );
    randomDate.setHours(0, 0, 0, 0);

    return randomDate;
}

async function main(tx) {
    // truncate all the tables
    console.log('Truncating all tables...');

    await tx.execute(sql`TRUNCATE TABLE users RESTART IDENTITY CASCADE`);
    await tx.execute(
        sql`TRUNCATE TABLE user_profiles RESTART IDENTITY CASCADE`
    );
    await tx.execute(
        sql`TRUNCATE TABLE categories RESTART IDENTITY CASCADE`
    );
    await tx.execute(
        sql`TRUNCATE TABLE matches RESTART IDENTITY CASCADE`
    );
    await tx.execute(
        sql`TRUNCATE TABLE service_requests RESTART IDENTITY CASCADE`
    );
    await tx.execute(
        sql`TRUNCATE TABLE shortlists RESTART IDENTITY CASCADE`
    );

    // seed user_profiles
    console.log('Seeding user profiles...');

    const [user_admin] = await tx
        .insert(userProfilesTable)
        .values({
            name: 'User Admin',
            description: `System moderator responsible for managing user accounts, maintaining platform integrity, and ensuring compliance with community guidelines.`,
            status: 'ACTIVE'
        })
        .returning();

    const [pin] = await tx
        .insert(userProfilesTable)
        .values({
            name: 'Person-In-Need',
            description: `Individual seeking volunteer assistance for various personal, professional, or community needs.`,
            status: 'ACTIVE'
        })
        .returning();

    const [csr] = await tx
        .insert(userProfilesTable)
        .values({
            name: 'CSR Representative',
            description: `Corporate social responsibility liaison who coordinates volunteer programs between organizations and the platform.`,
            status: 'ACTIVE'
        })
        .returning();

    const [platform_management] = await tx
        .insert(userProfilesTable)
        .values({
            name: 'Platform Management',
            description: `System administrator overseeing platform operations, technical infrastructure, and strategic development initiatives.`,
            status: 'ACTIVE'
        })
        .returning();

    // seed users
    console.log('Seeding users...');

    const allUsers = {
        'User Admin': [],
        'Person-In-Need': [],
        'CSR Representative': [],
        'Platform Management': []
    };

    for (const user of users) {
        const random = Math.random() * 100;

        let profile = pin;
        if (random < 5) profile = user_admin;
        else if (random < 10) profile = platform_management;
        else if (random < 30) profile = csr;

        const { user_id } = (await tx.insert(usersTable).values({
            fullname: user,
            email: getEmail(user),
            username: getPassword(user),
            password: getPassword(user),
            phone_number: getPhoneNumber(),
            address: `Lorem ipsum dolor sit amet...`,
            date_of_birth: getDOB(),
            status: 'ACTIVE',
            user_profile: profile.name,
        }).returning())[0];
        
        allUsers[profile.name].push(user_id);
    }

    console.log('Seeding categories...');

    for (const category of categories) {
        await tx.insert(categoriesTable).values({
            name: category[0],
            description: category[1],
            status: 'ACTIVE'
        });
    };

    console.log('Seeding service requests...');

    const requests = [];
    for (const request of serviceRequests) {
        const date_created = randomDate()

        const { service_request_id } = (await tx.insert(serviceRequestsTable).values({
            title: request[0],
            description: request[1],
            category: request[2],
            status: 'ACTIVE',
            created_by: allUsers
                ['Person-In-Need']
                [Math.floor(Math.random() * allUsers['Person-In-Need'].length)],
            view_count: Math.floor(Math.random() * 10) + 1,
            date_created: date_created
        }).returning())[0];
        requests.push({ request: service_request_id, date_created });
    };

    console.log('Seeding shortlists...');

    const shortlistSet = new Set();

    for (const { request, date_created } of requests) {
        while (Math.random() > 0.15) {
            const shortlisted_by = allUsers
                    ['CSR Representative']
                    [Math.floor(Math.random() * allUsers['CSR Representative'].length)]

            do {
                var date = randomDate();
            } while(date < date_created)

            const key = `${request}-${shortlisted_by}`;

            if (!shortlistSet.has(key)) {
                await tx.insert(shortlistsTable).values({
                    service_request: request,
                    shortlisted_by: shortlisted_by,
                    date_created: date
                })
                
                shortlistSet.add(key);
            }
        }
    };

    console.log('Seeding matches...');

    for (const { request, date_created } of requests) {
        if (Math.random() < 0.3) continue;

        let status = 'ACTIVE';
        if (Math.random() < 0.4) status = 'COMPLETED';

        let date;
        do {
            date = randomDate();
        } while(date < date_created)

        await tx.insert(matchesTable).values({
            service_request: request,
            matched_by: allUsers
                ['CSR Representative']
                [Math.floor(Math.random() * allUsers['CSR Representative'].length)],
            status: status,
            date_created: date_created
        });

        if (status == 'COMPLETED') {
            let date_completed;
            do {
                date_completed = randomDate();
            } while(date_completed < date_created)

            await tx
                .update(serviceRequestsTable)
                .set({ date_completed })
                .where(eq(serviceRequestsTable.service_request_id, request));
        }
    };

    console.log('Committing changes...');
}

const db = DB.getInstance().getDatabase();

await db.transaction(async (tx) => {
    await main(tx);
});
