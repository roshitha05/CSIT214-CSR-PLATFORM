import Entity from "./entity.js";
import HasherEntity from "./hasher.js";
import UserProfilesEntity from "./user-profiles.js";
import UsersEntity from "./users.js";

export default class AuthEntity extends Entity {
    constructor() {
        super();
    }

    async authenticateUser(credentials) {
        const usersEntity = new UsersEntity();
        const userProfilesEntity = new UserProfilesEntity();

        let user = await usersEntity.getUsers({ 
            username: credentials.login
        });
        if (user.length !== 1) {
            user = await usersEntity.getUsers({ 
                email: credentials.login
            });
        }
        if (user.length !== 1) return false;
        user = user[0];

        if (!await new HasherEntity().verify(credentials.password, user.password)) return false;
        if (user.status.toLowerCase() !== 'active') return false;
        const userProfile = (await userProfilesEntity
            .getUserProfiles({ name: user.user_profile }))[0];
        if (userProfile.status.toLowerCase() !== 'active') return false;

        return user;
    }
}