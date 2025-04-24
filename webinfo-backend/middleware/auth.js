const authUser = require('./authUser');
const authAdmin = require('./authAdmin');

module.exports = {
    auth: authUser,
    isAdmin: authAdmin
}; 