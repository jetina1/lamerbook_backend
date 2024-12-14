import axios from "axios";
import pool from '../db.js'; // Import the pool

export async function initializePayment(req, res) {
  const { amount, email, fullname, txRef, callbackUrl, bookId, userId } = req.body;

  const chapaUrl = "https://api.chapa.co/v1/transaction/initialize";

  try {
    const response = await axios.post(
      chapaUrl,
      {
        amount,
        currency: "ETB",
        email,
        first_name: fullname,
        tx_ref: txRef,
        callback_url: callbackUrl,
        customization: {
          title: "Et Books Payment",
          description: "Payment for books purchased",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`, // Ensure your .env is properly configured
        },
      }
    );

    // Insert a record into `user_book` table with default `isfree = false`
    await pool.query(
      `INSERT INTO user_book (user_id, book_id, isfree, purchased_at)
       VALUES ($1, $2, $3, NULL)`,
      [userId, bookId, false] // Initial state is not free (false)
    );

    res.status(200).json({
      status: "success",
      data: response.data.data, // Checkout URL and other details
    });
  } catch (error) {
    console.error("Payment Initialization Error:", error.response ? error.response.data : error.message);
    res.status(500).json({
      status: "error",
      message: error.response ? error.response.data : error.message,
    });
  }
}

export async function webhook(req, res) {
  const paymentData = req.body;

  // Extract necessary details from the webhook payload
  const { tx_ref, status } = paymentData;

  try {
    if (status === "success") {
      // Assuming tx_ref contains userId and bookId (e.g., 'userId:bookId')
      const [userId, bookId] = tx_ref.split(":");

      // Update the user_book table to mark as purchased and isfree = true
      await pool.query(
        `UPDATE user_book
         SET isfree = true, purchased_at = NOW()
         WHERE user_id = $1 AND book_id = $2`,
        [userId, bookId]
      );
    }

    // Log payment data for debugging purposes
    console.log("Webhook Received:", paymentData);

    // Respond with 200 OK
    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Handling Error:", error);
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
}







//not updated

// export async function iinitializePayment(req, res) {
// //   const { amount, email, firstName, lastName, txRef, callbackUrl } = req.body;
//   const { amount, email, fullname, txRef, callbackUrl } = req.body;
// // const [firstName, lastName] = fullname.split(' ');


//   const chapaUrl = "https://api.chapa.co/v1/transaction/initialize";

//   try {
//     const response = await axios.post(
//       chapaUrl,
//       {
//         amount,
//         currency: "ETB",
//         email,
//         first_name: fullname,
//         // last_name: lastName,
//         tx_ref: txRef,
//         callback_url: callbackUrl,
//         customization: {
//           title: "Et Books Payment",
//           description: "Payment for books purchased",
//         },
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.CHAPA_SECRET_KEY}`, // Ensure your .env is properly configured
//         },
//       }
//     );

//     res.status(200).json({
//       status: "success",
//       data: response.data.data, // Checkout URL and other details
//     });
//   } catch (error) {
//     console.log(error);
//     console.error("Payment Initialization Error:", error.response ? error.response.data : error.message);
//     res.status(500).json({
//       status: "error",
//       message: error.response ? error.response.data : error.message,
//     });
//   }
// }

// export function wwebhook(req, res) {
//   const paymentData = req.body;

//   // Handle the payment data and update the order/payment status in your database
//   console.log("Webhook Received:", paymentData);

//   // Always respond with a 200 OK status
//   res.sendStatus(200);
// }