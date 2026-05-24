import { asyncHandler } from "../utils/AsyncHandler.js";
import { APIError } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { User } from "../models/user.model.js";
import { Rides } from "../models/rides.js";
const select_location = asyncHandler(async (req, res) => {
  const {
    pickup_location,
    destination,
    pickup_coords,
    destination_coords,
  } = req.body;
  const passenger_id = req.user._id;
  if (!pickup_location || !destination) {
    throw new APIError(402, "enter your pickup and destination location");
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
    pickup_coords,
    destination_coords,
    status: "pending",
  });
  // This grabs the global 'io' object we attached in server.js
  const io = req.app.get("io");
  io.to("drivers_room").emit("new_ride_offer", {
    ride_id: new_request._id,
    passenger_id: new_request.passenger_id,
    pickup_location: new_request.pickup_location,
    destination: new_request.destination,
    pickup_coords: new_request.pickup_coords,
    destination_coords: new_request.destination_coords,
    status: new_request.status,
  });
  return res.status(201).json(
    new APIresponse(
      201,
      "Ride request sent to all available drivers. Waiting for offers.",
      { ride: new_request },
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
    io.to(String(driver_id)).emit("offer_accepted", {
      msg: `${username} accepted your offer for ride ${ride_id}`,
      ride_id,
      driver_id,
      ride_details,
    });

    return res
    .status(200)
    .json(
        new APIresponse(200,"you accepted the drivers offer")
    )

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
    io.to(String(driver_id)).emit("offer_cancelled", {
      msg: `${username} rejected your offer for ride ${ride_id}`,
      ride_id,
      driver_id,
      ride_details,
    });

    return res
      .status(200)
      .json(new APIresponse(200, "You rejected the driver's offer"));

});

const reject_offer = asyncHandler(async (req, res) => {
  const { ride_id, driver_id } = req.body;
  if (!ride_id || !driver_id) {
    throw new APIError(400, "ride_id and driver_id are required");
  }

  const io = req.app.get("io");
  io.to(String(driver_id)).emit("offer_rejected", {
    msg: "The passenger rejected your fare offer",
    ride_id,
    driver_id,
  });

  return res
    .status(200)
    .json(new APIresponse(200, "Offer rejected. Driver has been notified."));
});

export { select_location, accept_ride, cancel_ride, reject_offer };
