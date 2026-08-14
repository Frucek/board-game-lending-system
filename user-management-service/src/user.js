class User {
    constructor(id, name, email, status, borrowingLimit) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.status = status;
        this.borrowingLimit = borrowingLimit;
    }
}

module.exports = User;