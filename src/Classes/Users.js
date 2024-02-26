// Třída pro záznam uživatele

export default class Users {
    constructor(username, email, password, id) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.id = id;
    }
}