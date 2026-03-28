const USER_DB_KEY = 'riseUsersDB';
const PROFILE_PICS_DB_KEY = 'riseProfilePicsDB';
const CURRENT_USER_KEY = 'riseCurrentUser';

function initUserDatabase() {
    if (!localStorage.getItem(USER_DB_KEY)) {
        localStorage.setItem(USER_DB_KEY, JSON.stringify([]));
    }
}

function getUsers() {
    initUserDatabase();
    return JSON.parse(localStorage.getItem(USER_DB_KEY));
}

function saveUsers(users) {
    localStorage.setItem(USER_DB_KEY, JSON.stringify(users));
}

function initProfilePictureDatabase() {
    if (!localStorage.getItem(PROFILE_PICS_DB_KEY)) {
        localStorage.setItem(PROFILE_PICS_DB_KEY, JSON.stringify([]));
    }
}

function getProfilePictures() {
    initProfilePictureDatabase();
    return JSON.parse(localStorage.getItem(PROFILE_PICS_DB_KEY));
}

function saveProfilePictures(pictures) {
    localStorage.setItem(PROFILE_PICS_DB_KEY, JSON.stringify(pictures));
}

function getProfilePicture(email) {
    if (!email) return '';
    const normalized = email.trim().toLowerCase();
    const picture = getProfilePictures().find(item => item.email.toLowerCase() === normalized);
    return picture ? picture.profilePic : '';
}

function setProfilePicture(email, profilePic) {
    if (!email) return null;
    const normalized = email.trim().toLowerCase();
    const pictures = getProfilePictures();
    const index = pictures.findIndex(item => item.email.toLowerCase() === normalized);
    if (index === -1) {
        pictures.push({ email: normalized, profilePic });
    } else {
        pictures[index].profilePic = profilePic;
    }
    saveProfilePictures(pictures);
    return profilePic;
}

function findUserByIdentifier(identifier) {
    if (!identifier) return null;
    const normalized = identifier.trim().toLowerCase();
    return getUsers().find(user =>
        user.email.toLowerCase() === normalized || user.username.toLowerCase() === normalized
    ) || null;
}

function registerUser({ username, email, password }) {
    if (!username || !email || !password) {
        return { success: false, error: 'Please fill in all fields.' };
    }

    username = username.trim();
    email = email.trim().toLowerCase();
    password = password.trim();

    if (findUserByIdentifier(username) || findUserByIdentifier(email)) {
        return { success: false, error: 'An account with that username or email already exists.' };
    }

    const newUser = {
        username,
        email,
        password,
        profilePic: '',
        createdAt: new Date().toISOString()
    };

    const users = getUsers();
    users.push(newUser);
    saveUsers(users);
    setProfilePicture(email, '');

    return { success: true, user: newUser };
}

function loginUser(identifier, password) {
    if (!identifier || !password) {
        return { success: false, error: 'Enter your email or username and password.' };
    }

    const user = findUserByIdentifier(identifier);
    if (!user || user.password !== password) {
        return { success: false, error: 'Invalid credentials. Please try again.' };
    }

    setCurrentUser({
        username: user.username,
        email: user.email,
        profilePic: user.profilePic || getProfilePicture(user.email) || '',
        createdAt: user.createdAt
    });

    return { success: true, user };
}

function updateUserProfilePic(email, profilePic) {
    if (!email) return null;
    const users = getUsers();
    const index = users.findIndex(user => user.email.toLowerCase() === email.toLowerCase());
    if (index === -1) return null;
    users[index].profilePic = profilePic;
    saveUsers(users);
    setProfilePicture(users[index].email, profilePic);

    const currentUser = getCurrentUser();
    if (currentUser && currentUser.email.toLowerCase() === email.toLowerCase()) {
        currentUser.profilePic = profilePic;
        setCurrentUser(currentUser);
    }

    return users[index];
}

function setCurrentUser(user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
    } catch {
        return null;
    }
}

function logoutCurrentUser() {
    localStorage.removeItem(CURRENT_USER_KEY);
}

function isUserLoggedIn() {
    return !!getCurrentUser();
}

initUserDatabase();
