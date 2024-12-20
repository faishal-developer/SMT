"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userService = void 0;
const user_model_1 = require("./user.model");
const ApiError_1 = __importDefault(require("../../errorHandler/ApiError"));
const http_status_1 = __importDefault(require("http-status"));
const commonFunction_1 = require("../../shared/commonFunction");
const utils_1 = require("../../utils/utils");
const trainee_model_1 = require("../trainee/trainee.model");
const trainer_model_1 = require("../trainer/trainer.model");
const createUser = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.User.findOne({
        email: user.email,
    });
    if (isExist) {
        throw new ApiError_1.default(409, "Email is allready used");
    }
    if (user.role === utils_1.userRoles.admin) {
        throw new ApiError_1.default(409, "admin will not be created");
    }
    const result = yield user_model_1.User.create(user);
    let specificUser;
    if (user.role === utils_1.userRoles.trainee) {
        specificUser = yield trainee_model_1.Trainee.create({
            isMember: false,
            userId: result._id,
        });
        user_model_1.User.findOneAndUpdate({ _id: result._id }, { traineeId: specificUser._id }, {
            new: true,
        });
    }
    else {
        specificUser = yield trainer_model_1.Trainer.create({
            userId: result._id,
        });
        user_model_1.User.findOneAndUpdate({ _id: result._id }, { trainerId: specificUser._id }, {
            new: true,
        });
    }
    const userData = result.toObject();
    return userData;
});
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.find({});
    return result;
});
const getSingleUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findById({ _id: id });
    return result;
});
const getMyProfile = (accessToken) => __awaiter(void 0, void 0, void 0, function* () {
    const verifiedUser = (0, commonFunction_1.verifyAccessToken)(accessToken);
    const result = yield user_model_1.User.findOne({ phoneNumber: verifiedUser.phoneNumber }, "name phoneNumber address");
    return result;
});
const updateUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield user_model_1.User.findById({ _id: id });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found !");
    }
    if (isExist.role === "admin" &&
        (data.role === user_model_1.role[1] || data.role === user_model_1.role[2])) {
        throw new ApiError_1.default(http_status_1.default.METHOD_NOT_ALLOWED, "Admin should not be modified");
    }
    if ((isExist.role === user_model_1.role[1] || isExist.role === user_model_1.role[2]) &&
        data.role === "admin") {
        throw new ApiError_1.default(http_status_1.default.METHOD_NOT_ALLOWED, "User should not be modified into admin");
    }
    const result = yield user_model_1.User.findOneAndUpdate({ _id: id }, data, {
        new: true,
    });
    return result;
});
const updateMyProfile = (accessToken, data) => __awaiter(void 0, void 0, void 0, function* () {
    if (Object.keys(data).length <= 0) {
        throw new ApiError_1.default(404, "No content found to update");
    }
    if (data.email) {
        throw new ApiError_1.default(409, "Please don't change email");
    }
    const verifiedUser = (0, commonFunction_1.verifyAccessToken)(accessToken);
    console.log(verifiedUser);
    const isExist = yield user_model_1.User.findOne({
        phoneNumber: verifiedUser.phoneNumber,
    });
    if (!isExist) {
        throw new ApiError_1.default(http_status_1.default.NOT_FOUND, "User not found !");
    }
    // if (
    //   isExist.role === "admin" &&
    //   (data.role === role[1] || data.role === role[2])
    // ) {
    //   throw new ApiError(
    //     httpStatus.METHOD_NOT_ALLOWED,
    //     "Admin should not be modified"
    //   );
    // }
    // if (
    //   (isExist.role === role[1] || isExist.role === role[2]) &&
    //   data.role === "admin"
    // ) {
    //   throw new ApiError(
    //     httpStatus.METHOD_NOT_ALLOWED,
    //     "User should not be modified into admin"
    //   );
    // }
    const result = yield user_model_1.User.findOneAndUpdate({ phoneNumber: verifiedUser.phoneNumber }, data, {
        new: true,
    });
    return result;
});
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_model_1.User.findByIdAndDelete({ _id: id });
    return result;
});
exports.userService = {
    createUser,
    getAllUser,
    getSingleUser,
    updateUser,
    deleteUser,
    getMyProfile,
    updateMyProfile,
};
