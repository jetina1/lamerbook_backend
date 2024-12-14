import express, { Router } from 'express';
// import bodyParser from 'body-parser';
const router = express.Router();
import { initializePayment ,webhook} from "../controllers/payment.controller.js";

// Route to initialize payment
// router.post("/initialize", initializePayment);
router.post('/create-payment', async (req, res) => {
    const { amount, email } = req.body;
    const response = await chapa.createPayment({ amount, email });
    res.json(response);
});
// Route to initialize payment
router.post("/initialize", initializePayment);

// Webhook endpoint to handle payment notifications
router.post("/webhook", webhook);
// router.post('/webhook', (req, res) => {
//     const paymentData = req.body;
//     // Process payment data, update order status etc.
//     res.sendStatus(200);
// });

export default router;




// // app.use(bodyParser.json());



// export default router; // Use export default