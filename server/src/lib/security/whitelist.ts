import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import dotenv from "dotenv";

dotenv.config();

const productionHostname = /^(?:[a-z0-9-]+\.)*nexochess\.com$/i;
const developmentHostnames = [
    /^localhost$/i,
    /^127\.0\.0\.1$/
];

const whitelistedHostnames = [
    productionHostname,
    ...(process.env.NODE_ENV == "development"
        ? developmentHostnames : []
    )
];

const hostnameWhitelist: RequestHandler = (req, res, next) => {
    const hostWhitelisted = whitelistedHostnames.some(
        hostnameRegex => hostnameRegex.test(req.hostname)
    );

    if (!hostWhitelisted) {
        return res.sendStatus(StatusCodes.UNAUTHORIZED);
    }

    next();
};

export default hostnameWhitelist;
