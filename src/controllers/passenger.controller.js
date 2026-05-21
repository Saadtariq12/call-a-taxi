import { asyncHandler } from "../utils/AsyncHandler";
import { APIError } from "../utils/APIerror";
import { APIresponse } from "../utils/APIresponse";
import { User } from "../models/user.model";
import { Rides } from "../models/rides";
const select_location = asyncHandler(async (req, res) => {
  const { pickup_location, destination } = req.body;
  const passenger_id = req.user._id;
  if (!pickup_location || !destination) {
    throw new APIError(402, "enter your current and destination location");
  }
  const drivers = await User.find({
    role: "driver",
  });
  if (drivers.length === 0) {
    throw new APIError(
      404,
      "No drivers available at the moment, try again later",
    );
  }
  const new_request = await Rides.create({
    passenger_id,
    pickup_location,
    destination,
    status: "pending",
  });
  // This grabs the global 'io' object we attached in server.js
  const io = req.app.get("io");
  io.to("drivers_room").emit("new_ride_offer", { //emit is used for alert(alert the drivers in th room that there is a new offer). its written with underscore for the frontend to connect(optional to use underscore)
    ride_id: new_request._id,
    passenger_id: new_request.passenger_id,
    destination: new_request.destination,
    status: new_request.status,
  });
  return res
    .status(201)
    .json(
      new APIresponse(
        201,
        `Ride request sent to all available drivers. Waiting for acceptance.`,
      ),
    );
});

const accept_ride = asyncHandler(async (req,res) => {
    const {ride_id,driver_id} = req.body;
    const passenger_id = req.user._id;
    const ride_details = await Rides.findByIdAndUpdate(
        ride_id,
        { status: "accepted" },
        { new:true }
    ).populate("passenger_id","username");
    if (!ride_details) {
      throw new APIError(404, "Ride not found.");
    }
    const username = ride_details.passenger_id.username
    const io = req.app.get("io");
    io.to(driver_id).emit("offer_accepted", {
      msg: `${username} with rideid:${ride_id} accepted your offer`,
      ride_details
    });

})
const cancel_ride = asyncHandler(async (req,res) => {
    const { ride_id, driver_id } = req.body;
    const passenger_id = req.user._id;
    const ride_details = await Rides.findByIdAndUpdate(
      ride_id,
      { status: "cancelled" },
      { new: true },
    ).populate("passenger_id", "username");
    if (!ride_details) {
      throw new APIError(404, "Ride not found.");
    }
    const username = ride_details.passenger_id.username;
    const io = req.app.get("io");
    io.to(driver_id).emit("offer_cancelled", {
      msg: `${username} with rideid:${ride_id} cancelled the ride`,
      ride_details,
    });

})
export { select_location };
