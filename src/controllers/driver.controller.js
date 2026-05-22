import { asyncHandler } from "../utils/AsyncHandler.js";
import { APIError } from "../utils/APIerror.js";
import { APIresponse } from "../utils/APIresponse.js";
import { User } from "../models/user.model.js";
import { Rides } from "../models/rides.js";
const propose_fair = asyncHandler(async (req, res) => {
  const { ride_id, fare } = req.body;
  const driver_id = req.user._id;
  const driverName = req.user.username;
  if (!ride_id || !fare) {
    throw new APIError(401, "choose a passenger and fair");
  }
  const ride = await Rides.findById(ride_id);
  if (!ride || ride.status != "pending") {
    throw new APIError(403, "this passenger is no longer available");
  }
  const newOffer = { driver_id, driverName, fare: Number(fare) };
  ride.offers.push(newOffer);
  await ride.save();

  const io = req.app.get("io");

  io.to(ride_id).emit("new_fair_offer",{
    offer: newOffer
  })
  return res
    .status(200)
    .json(new APIresponse(200, "Fare offered successfully.", ride));
});
export { propose_fair };
