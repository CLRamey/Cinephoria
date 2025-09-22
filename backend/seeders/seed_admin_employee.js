"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// Seeder for the Cinephoria application to create admin and employee initial accounts in the SQL database
var init_models_1 = require("../src/models/init-models");
var databaseSql_1 = require("../src/config/databaseSql");
var userPassword_1 = require("../src/utils/userPassword");
var logger_1 = require("../src/utils/logger");
var AdminEmail = process.env['ADMIN_EMAIL'];
var AdminUsername = process.env['ADMIN_USERNAME'];
var AdminPassword = process.env['ADMIN_PASSWORD'];
var EmployeeEmail = process.env['EMPLOYEE_EMAIL'];
var EmployeeUsername = process.env['EMPLOYEE_USERNAME'];
var EmployeePassword = process.env['EMPLOYEE_PASSWORD'];
var STAFF_USERS = [
    {
        userFirstName: 'Admin',
        userLastName: 'Account',
        userUsername: AdminUsername,
        userEmail: AdminEmail,
        userPassword: AdminPassword,
        userRole: 'admin',
    },
    {
        userFirstName: 'Employee',
        userLastName: 'Account',
        userUsername: EmployeeUsername,
        userEmail: EmployeeEmail,
        userPassword: EmployeePassword,
        userRole: 'employee',
    },
];
var defaultFlags = {
    mustChangePassword: false,
    isVerified: true,
    agreedPolicy: true,
    agreedCgvCgu: true,
};
var insertStaffUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _i, STAFF_USERS_1, userData, existing, hashed, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 9, , 10]);
                return [4 /*yield*/, databaseSql_1.sequelize.authenticate()];
            case 1:
                _a.sent();
                (0, logger_1.log)('Connected to DB');
                _i = 0, STAFF_USERS_1 = STAFF_USERS;
                _a.label = 2;
            case 2:
                if (!(_i < STAFF_USERS_1.length)) return [3 /*break*/, 7];
                userData = STAFF_USERS_1[_i];
                if (!userData.userEmail) {
                    (0, logger_1.logerror)("Staff email are not set in environment variables for ".concat(userData.userRole, "."));
                    return [3 /*break*/, 6];
                }
                return [4 /*yield*/, init_models_1.user.findOne({ where: { userEmail: userData.userEmail } })];
            case 3:
                existing = _a.sent();
                if (existing) {
                    (0, logger_1.log)("A staff member already exists");
                    return [3 /*break*/, 6];
                }
                if (!userData.userPassword) {
                    (0, logger_1.logerror)("Staff password is not set for ".concat(userData.userRole, "."));
                    return [3 /*break*/, 6];
                }
                return [4 /*yield*/, (0, userPassword_1.hashPassword)(userData.userPassword)];
            case 4:
                hashed = _a.sent();
                return [4 /*yield*/, init_models_1.user.create(__assign(__assign(__assign({}, userData), { userEmail: userData.userEmail, userRole: userData.userRole, userPassword: hashed }), defaultFlags))];
            case 5:
                _a.sent();
                (0, logger_1.log)("Created ".concat(userData.userRole));
                _a.label = 6;
            case 6:
                _i++;
                return [3 /*break*/, 2];
            case 7:
                (0, logger_1.log)('All staff users created');
                (0, logger_1.log)('Closing sequelize connection...');
                return [4 /*yield*/, databaseSql_1.sequelize.close()];
            case 8:
                _a.sent();
                return [3 /*break*/, 10];
            case 9:
                err_1 = _a.sent();
                (0, logger_1.logerror)('Error inserting staff users:', err_1);
                process.exit(1);
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
insertStaffUsers();
