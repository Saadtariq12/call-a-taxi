import { asyncHandler } from "../utils/AsyncHandler";
import { APIError } from "../utils/APIerror";
import { APIresponse } from "../utils/APIresponse";
import { User } from "../models/user.model";
import { Rides } from "../models/rides";
const propose_fair = asyncHandler(async (req, res) => {
  const { passenger_id, fair } = req.body;
  const driver_id = req.user._id;
  const driverName = req.user.username;
  if (!passenger_id || !fair) {
    throw new APIError(401, "choose a passenger and fair");
  }
  const ride = await Rides.findById(passenger_id);
  if (!ride || ride.status != "pending") {
    throw new APIError(403, "this passenger is no longer available");
  }
  const newOffer = { driverId, driverName, fare: Number(fare) };
  ride.offers.push(newOffer);
  await ride.save();

  const io = req.app.get("io");
  
  io.to(passenger_id).emit("new_fair_offer",{
    offer: newOffer
  })
  return res
    .status(200)
    .json(new APIresponse(200, "Fare offered successfully.", ride));
});
export { get_available_rides };
