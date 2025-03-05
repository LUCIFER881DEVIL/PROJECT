// import {ApiError} from "../utils/ApiError.js"
import mongoose from "mongoose";
import {Apiresponses} from "../utils/Apiresponses.js"
import {asynchandler} from "../utils/asynchandler.js"


// const healthcheck = asynchandler(async (req, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message

    const healthcheck = asynchandler(async (req, res) => {
        // Check MongoDB connection status
        const dbStatus = mongoose.connection.readyState;
        let dbHealth = "unknown";
    
        switch (dbStatus) {
            case 0:
                dbHealth = "disconnected";
                break;
            case 1:
                dbHealth = "connected";
                break;
            case 2:
                dbHealth = "connecting";
                break;
            case 3:
                dbHealth = "disconnecting";
                break;
            default:
                dbHealth = "unknown";
        }
    
        console.log("Database Health:", dbHealth);
    
        // Create a health check response
        const healthStatus = {
            status: "healthy",
            uptime: process.uptime(),
            timestamp: new Date(),
            services: {
                api: "running",
                database: dbHealth
            }
        };
    
        // If database is not connected, mark overall status as unhealthy
        if (dbHealth !== "connected") {
            healthStatus.status = "unhealthy";
        }
    
        return res
            .status(200)
            .json
            (new Apiresponses(200, healthStatus, "Health check successful"));
    });
    



export {
    healthcheck
    }
    