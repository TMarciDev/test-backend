import Subscription from "../models/subscription";
import User from "../models/user";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const stripeRaw = require("stripe");

export const prices = async (req, res) => {
  const prices = await stripe.prices.list();
  // console.log('prices', prices)
  res.json(prices.data.reverse());
};

export const webhook = async (req, res) => {
  console.log("webhook started");
  stripe = stripeRaw;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "invoice.payment_succeeded":
      console.log("put");

      const invoice = event.data.object;
      // Then define and call a function to handle the event invoice.payment_succeeded
      const newSub = new Subscription({
        data: [JSON.stringify(invoice)],
      });
      try {
        const savedSub = await newSub.save();
        res.status(201).json(savedSub);
      } catch (err) {
        res.status(500).json(err);
      }

      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  //res.send();
};

// export const createSubscription = async (req, res) => {
//     // console.log("req_data", JSON.stringify(req.body));
//     try {
//       const subscription = await new Subscription({
//         data: JSON.stringify(req.body.subscription),
//         userID: req.userId
//       }).save(object);
//       console.log("success", subscription);
//      res.json({
//         result: "success",
//       });
//     }
//     catch (error) {
//       console.log(error);
//     }

// }
export const createSubscription = async (req, res) => {
  // console.log("req_data", JSON.stringify(req.body));
  try {
    const data = JSON.stringify(req.body.subscription, null, 4);
    console.log(data);
    if (!req.body.subscription) {
      return res.status(400).send("no subscription");
    } else {
      const user = await User.findByIdAndUpdate(req.user._id, {
        subscriptions: data,
      });

      if (!user)
        return res
          .status(400)
          .send("User not found")

          .save();
      console.log("success");
      return res.json({
        result: "success",
      });
    }
  } catch (error) {
    console.log(error);
  }
};

export const subscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        subscriptions: subscriptions.data,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.log(err);
  }
};

export const subscriptions = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: "all",
      expand: ["data.default_payment_method"],
    });

    res.json(subscriptions);
  } catch (err) {
    console.log(err);
  }
};

export const customerPortal = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: process.env.STRIPE_SUCCESS_URL,
    });
    res.json(portalSession.url);
  } catch (err) {
    console.log(err);
  }
};
