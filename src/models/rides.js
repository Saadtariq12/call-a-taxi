import mongoose from "mongoose";
const rides_schema = new mongoose.Schema({
        passenger_id:{
            type: mongoose.Schema.ObjectId,
            ref: "User",
        },
        pickup_loction: String,
        destination: String,
        status:{
          type:String,
          enum:["pending","accepted","cancelled"],
          default:"pending"
        },
  offers: [
    {
      driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      driverName: { type: String },
      fare: { type: Number },
    },
  ],
});
export const Rides = mongoose.model("Rides", rides_schema);