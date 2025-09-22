import nodemailer from "nodemailer";

/* Reusable transporter */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/* Helpers */
const isValidRecipient = (to) =>
  typeof to === "string" && to.includes("@") && !/[<>]/.test(to);

const toCurrency = (n) =>
  typeof n === "number" ? n.toFixed(2) : String(n ?? "");

const formatDate = (d) => {
  const dt = d instanceof Date ? d : new Date(d);
  return isNaN(dt) ? "" : dt.toDateString();
};

/* sendMail – supports object or legacy signature */
export const sendMail = async (arg1, subject, htmlContent, textContent) => {
  let to, html, text, subj;

  if (typeof arg1 === "object" && arg1 !== null) {
    ({ to, subject: subj, html, text } = arg1);
  } else {
    to = arg1;
    subj = subject;
    html = htmlContent;
    text = textContent;
  }

  if (!isValidRecipient(to)) {
    throw new Error("Invalid recipient email address");
  }
  if (!subj || !html) {
    throw new Error("Missing subject or html content");
  }

  const from = `"GoBus" <${process.env.EMAIL_USER}>`;

  try {
    await transporter.sendMail({
      from,
      to,
      subject: subj,
      html,
      text,
    });
    // console.log("Email sent");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

/* Theming note: HTML layout kept as in your original templates. */

/* Welcome email (HTML only, legacy-compatible) */
export const welcomeEmailTemplate = (username, verifyLink) => {
  return `
  <div style="max-width: 600px; margin: auto; background: rgba(249, 249, 249, 0.52); 
              border-radius: 12px; padding: 30px; 
              font-family: Arial, sans-serif; color: #333; line-height: 1.6;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://img.icons8.com/color/96/bus.png" alt="GoBus Logo" style="width:80px; height:80px;" />
    </div>

    <h2 style="color: #2b6cb0; text-align: center; margin-bottom: 10px;">
      Welcome to GoBus, ${username}!
    </h2>

    <hr style="border: none; border-top: 2px solid #eee; margin: 20px 0;" />

    <p style="font-size: 15px; text-align: center;">
      We’re excited to have you onboard 🎉  
      With <strong>GoBus</strong>, you can easily book bus tickets, track routes, 
      and enjoy a smooth travel experience.
    </p>

    <p style="font-size: 15px; text-align: center;">
      Start exploring and make your next journey easier with us.  
      We’re here to ensure every trip is <strong>safe, smooth, and comfortable</strong>.
    </p>

    <div style="text-align: center; margin-top: 25px;">
      <a href="${verifyLink}" target="_blank"
         style="display:inline-block; padding: 12px 24px; 
                background-color:#2b6cb0; color:#fff; 
                text-decoration:none; border-radius:8px; 
                font-size: 16px; font-weight: bold;">
        Verify Email
      </a>
    </div>

    <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #555;">
      <p>Safe travels,</p>
      <p><strong>The GoBus Team</strong></p>
    </div>
  </div>
  `;
};

/* Reset password (HTML only, legacy-compatible) */
export const resetPasswordTemplate = (username, resetLink) => {
  return `
  <div style="max-width: 600px; margin: auto; background: rgba(249, 249, 249, 0.52); 
              border-radius: 12px; padding: 30px; 
              font-family: Arial, sans-serif; color: #333; line-height: 1.6;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);"> 
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://img.icons8.com/color/96/bus.png" alt="GoBus Logo" style="width:80px; height:80px;" />
    </div>
    <h2 style="color: #2b6cb0; text-align: center; margin-bottom: 10px;">
      Password Reset Request
    </h2>
    <hr style="border: none; border-top: 2px solid #eee; margin: 20px 0;" />
    <p style="font-size: 15px; text-align: center;">To reset your password, please click the button below:</p>
    <div style="text-align: center; margin-top: 25px;">
      <a href="${resetLink}" target="_blank"
         style="display:inline-block; padding: 12px 24px; 
                background-color:#2b6cb0; color:#fff; 
                text-decoration:none; border-radius:8px; 
                font-size: 16px; font-weight: bold;">
        Reset Password
      </a>
    </div>
    <p style="font-size: 15px; text-align: center; margin-top: 20px;">
      If you did not request a password reset, please ignore this email.  
      This link will expire in 15 minutes.
    </p>
    <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #555;">
      <p>Safe travels,</p>
      <p><strong>The GoBus Team</strong></p>
    </div>
  </div>
  `;
};

/* Booking confirmation:
   - If called as bookingConfirmationTemplate(username, details) -> returns HTML (legacy)
   - If called as bookingConfirmationTemplate({ name, bookingRef, bus, route, travelDate, seatNumbers, totalPrice })
     -> returns { subject, html, text } (preferred)
*/
export const bookingConfirmationTemplate = (arg1, arg2) => {
  if (typeof arg1 === "object" && !arg2) {
    // Preferred object form -> { subject, html, text }
    const {
      name = "Customer",
      bookingRef = "",
      bus = "",
      route = "",
      travelDate,
      seatNumbers = [],
      totalPrice = 0,
    } = arg1 || {};

    const dateStr = formatDate(travelDate);
    const seatList = Array.isArray(seatNumbers)
      ? seatNumbers.join(", ")
      : String(seatNumbers ?? "");
    const totalStr = toCurrency(totalPrice);

    const subject = `Your booking ${bookingRef}`;
    const text = `Hi ${name}, your booking ${bookingRef} for ${bus} on ${dateStr} is confirmed. Route: ${route}. Seats: ${seatList}. Total: $${totalStr}`;
    const html = `
    <div style="max-width: 600px; margin: auto; background: rgba(249, 249, 249, 0.52);  
                border-radius: 12px; padding: 30px; 
                font-family: Arial, sans-serif; color: #333; line-height: 1.6; 
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="https://img.icons8.com/color/96/bus.png" alt="GoBus Logo" style="width:80px; height:80px;" />
      </div>
      <h2 style="color: #2b6cb0; text-align: center; margin-bottom: 10px;">
        Booking Confirmation
      </h2>
      <hr style="border: none; border-top: 2px solid #eee; margin: 20px 0;" />
      <p style="font-size: 15px; text-align: center;">
        Thank you for booking with GoBus, ${name}! 🎉
      </p>
      <p style="font-size: 15px; text-align: center;">
        Here are your booking details:
      </p>
      <ul style="font-size: 15px; list-style: none; padding: 0;">
        <li><strong>Reference:</strong> ${bookingRef}</li>
        <li><strong>Bus:</strong> ${bus}</li>
        <li><strong>Route:</strong> ${route}</li>
        <li><strong>Travel Date:</strong> ${dateStr}</li>
        <li><strong>Seat Numbers:</strong> ${seatList}</li>
        <li><strong>Total Price:</strong> $${totalStr}</li>
      </ul>
      <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #555;">
        <p>Safe travels,</p>
        <p><strong>The GoBus Team</strong></p>
      </div>
    </div>
    `;

    return { subject, html, text };
  }

  // Legacy 2-arg form -> HTML string only
  const username = arg1;
  const bookingDetails = arg2 || {};
  const seatList = Array.isArray(bookingDetails.seatNumbers)
    ? bookingDetails.seatNumbers.join(", ")
    : String(bookingDetails.seatNumbers ?? "");
  const dateStr = formatDate(bookingDetails.travelDate);
  const totalStr = toCurrency(bookingDetails.totalPrice);

  return `
  <div style="max-width: 600px; margin: auto; background: rgba(249, 249, 249, 0.52);  
              border-radius: 12px; padding: 30px;  
              font-family: Arial, sans-serif; color: #333; line-height: 1.6; 
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://img.icons8.com/color/96/bus.png" alt="GoBus Logo" style="width:80px; height:80px;" />
    </div>
    <h2 style="color: #2b6cb0; text-align: center; margin-bottom: 10px;">
      Booking Confirmation
    </h2>
    <hr style="border: none; border-top: 2px solid #eee; margin: 20px 0;" />
    <p style="font-size: 15px; text-align: center;">
      Thank you for booking with GoBus, ${username}! 🎉
    </p>
    <p style="font-size: 15px; text-align: center;">
      Here are your booking details:
    </p>
    <ul style="font-size: 15px; list-style: none; padding: 0;">
      <li><strong>Bus:</strong> ${bookingDetails.bus ?? ""}</li>
      <li><strong>Route:</strong> ${bookingDetails.route ?? ""}</li>
      <li><strong>Travel Date:</strong> ${dateStr}</li>
      <li><strong>Seat Numbers:</strong> ${seatList}</li>
      <li><strong>Total Price:</strong> $${totalStr}</li>
    </ul>
    <div style="text-align: center; margin-top: 30px; font-size: 14px; color: #555;">
      <p>Safe travels,</p>
      <p><strong>The GoBus Team</strong></p>
    </div>
  </div>
  `;
};

// Enhanced booking confirmation email template
export const enhancedBookingConfirmationTemplate = (bookingData) => {
  const {
    username,
    bookingReference,
    slug,
    busNumber,
    busType,
    routeName,
    origin,
    destination,
    travelDate,
    seatNumbers,
    passengerNames,
    totalAmount,
    paymentStatus,
    boardingPoint,
    droppingPoint,
  } = bookingData;

  const seatList = Array.isArray(seatNumbers)
    ? seatNumbers.join(", ")
    : String(seatNumbers || "");
  const passengerList = Array.isArray(passengerNames)
    ? passengerNames.join(", ")
    : String(passengerNames || "");
  const dateStr = formatDate(travelDate);
  const totalStr = toCurrency(totalAmount);

  const subject = `🎉 Booking Confirmed - ${bookingReference}`;

  const html = `
  <div style="max-width: 600px; margin: auto; background: rgba(249, 249, 249, 0.52); 
              border-radius: 12px; padding: 30px; 
              font-family: Arial, sans-serif; color: #333; line-height: 1.6;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://img.icons8.com/color/96/bus.png" alt="GoBus Logo" style="width:80px; height:80px;" />
    </div>

    <h2 style="color: #2b6cb0; text-align: center; margin-bottom: 10px;">
      🎉 Booking Confirmed!
    </h2>

    <hr style="border: none; border-top: 2px solid #eee; margin: 20px 0;" />

    <p style="font-size: 15px; text-align: center;">
      Hello ${username}, your bus booking has been confirmed! 
    </p>

    <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; 
                border-left: 4px solid #2b6cb0;">
      <h3 style="color: #2b6cb0; margin-top: 0;">📋 Booking Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; font-weight: bold;">Booking Reference:</td><td style="padding: 8px 0;">${bookingReference}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Bus:</td><td style="padding: 8px 0;">${busNumber} (${busType})</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Route:</td><td style="padding: 8px 0;">${routeName}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">From:</td><td style="padding: 8px 0;">${origin}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">To:</td><td style="padding: 8px 0;">${destination}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Travel Date:</td><td style="padding: 8px 0;">${dateStr}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Seat Numbers:</td><td style="padding: 8px 0;">${seatList}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Passengers:</td><td style="padding: 8px 0;">${passengerList}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Total Amount:</td><td style="padding: 8px 0; color: #2b6cb0; font-weight: bold;">₹${totalStr}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Payment Status:</td><td style="padding: 8px 0;"><span style="background: ${
          paymentStatus === "paid" ? "#10b981" : "#f59e0b"
        }; color: white; padding: 2px 8px; border-radius: 4px; font-size: 12px;">${paymentStatus?.toUpperCase()}</span></td></tr>
      </table>
    </div>

    ${
      boardingPoint
        ? `
    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="color: #2b6cb0; margin-top: 0;">📍 Journey Points</h4>
      <p style="margin: 5px 0;"><strong>Boarding Point:</strong> ${boardingPoint}</p>
      ${
        droppingPoint
          ? `<p style="margin: 5px 0;"><strong>Dropping Point:</strong> ${droppingPoint}</p>`
          : ""
      }
    </div>
    `
        : ""
    }

    <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="color: #d97706; margin-top: 0;">⚠️ Important Information</h4>
      <ul style="margin: 0; padding-left: 20px; color: #92400e;">
        <li>Please arrive at the boarding point 15 minutes before departure</li>
        <li>Carry a valid ID proof during travel</li>
        <li>Booking can be cancelled up to 2 hours before travel time</li>
        <li>Keep this email as your booking confirmation</li>
        <li>For any queries, use booking reference: <strong>${bookingReference}</strong></li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <p style="color: #666; font-size: 14px;">
        Track your booking: <a href="#" style="color: #2b6cb0; text-decoration: none;">${slug}</a>
      </p>
      <p style="color: #666; font-size: 14px;">
        For support, contact us at <a href="mailto:support@gobus.com" style="color: #2b6cb0;">support@gobus.com</a>
      </p>
      <p style="font-weight: bold; color: #2b6cb0;">Safe travels with GoBus! 🚌</p>
    </div>
  </div>
  `;

  const text = `
BOOKING CONFIRMED - ${bookingReference}

Hello ${username},

Your bus booking has been confirmed!

Booking Details:
- Reference: ${bookingReference}
- Bus: ${busNumber} (${busType})
- Route: ${routeName}
- From: ${origin}
- To: ${destination}
- Travel Date: ${dateStr}
- Seats: ${seatList}
- Passengers: ${passengerList}
- Total Amount: ₹${totalStr}
- Payment Status: ${paymentStatus?.toUpperCase()}

${boardingPoint ? `Boarding Point: ${boardingPoint}` : ""}
${droppingPoint ? `Dropping Point: ${droppingPoint}` : ""}

Important Information:
- Arrive 15 minutes early at boarding point
- Carry valid ID proof during travel
- Cancellation allowed up to 2 hours before travel
- Use booking reference ${bookingReference} for queries

Track your booking: ${slug}
Support: support@gobus.com

Safe travels with GoBus!
  `;

  return { subject, html, text };
};

// Seat unavailable notification template
export const seatUnavailableTemplate = (userData, seatData) => {
  const { username, email } = userData;
  const { busNumber, routeName, travelDate, unavailableSeats } = seatData;

  const seatList = Array.isArray(unavailableSeats)
    ? unavailableSeats.join(", ")
    : String(unavailableSeats || "");
  const dateStr = formatDate(travelDate);

  const subject = `❌ Seats Unavailable - ${routeName}`;

  const html = `
  <div style="max-width: 600px; margin: auto; background: rgba(249, 249, 249, 0.52); 
              border-radius: 12px; padding: 30px; 
              font-family: Arial, sans-serif; color: #333; line-height: 1.6;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);">

    <div style="text-align: center; margin-bottom: 20px;">
      <img src="https://img.icons8.com/color/96/bus.png" alt="GoBus Logo" style="width:80px; height:80px;" />
    </div>

    <h2 style="color: #e53e3e; text-align: center; margin-bottom: 10px;">
      ❌ Seats No Longer Available
    </h2>

    <hr style="border: none; border-top: 2px solid #eee; margin: 20px 0;" />

    <p style="font-size: 15px; text-align: center;">
      Hello ${username}, unfortunately the seats you requested are no longer available.
    </p>

    <div style="background: #fed7d7; padding: 20px; border-radius: 8px; margin: 20px 0; 
                border-left: 4px solid #e53e3e;">
      <h3 style="color: #c53030; margin-top: 0;">📋 Booking Attempt Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 8px 0; font-weight: bold;">Bus:</td><td style="padding: 8px 0;">${busNumber}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Route:</td><td style="padding: 8px 0;">${routeName}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Travel Date:</td><td style="padding: 8px 0;">${dateStr}</td></tr>
        <tr><td style="padding: 8px 0; font-weight: bold;">Unavailable Seats:</td><td style="padding: 8px 0; color: #c53030; font-weight: bold;">${seatList}</td></tr>
      </table>
    </div>

    <div style="background: #e6fffa; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="color: #319795; margin-top: 0;">💡 What You Can Do</h4>
      <ul style="margin: 0; padding-left: 20px; color: #2c7a7b;">
        <li>Try selecting different seats on the same bus</li>
        <li>Check other buses on the same route</li>
        <li>Consider traveling on a different date</li>
        <li>Contact our support team for assistance</li>
      </ul>
    </div>

    <div style="text-align: center; margin-top: 30px;">
      <a href="#" style="display: inline-block; background: #2b6cb0; color: white; 
                         padding: 12px 24px; text-decoration: none; border-radius: 8px; 
                         font-weight: bold;">
        Search Alternative Options
      </a>
    </div>

    <div style="text-align: center; margin-top: 20px;">
      <p style="color: #666; font-size: 14px;">
        Need help? Contact us at <a href="mailto:support@gobus.com" style="color: #2b6cb0;">support@gobus.com</a>
      </p>
      <p style="color: #2b6cb0;">We're here to help you find the perfect journey! 🚌</p>
    </div>
  </div>
  `;

  const text = `
SEATS NO LONGER AVAILABLE

Hello ${username},

Unfortunately, the seats you requested are no longer available.

Details:
- Bus: ${busNumber}
- Route: ${routeName}
- Travel Date: ${dateStr}
- Unavailable Seats: ${seatList}

What you can do:
- Try different seats on the same bus
- Check other buses on the same route
- Consider a different travel date
- Contact support for assistance

Support: support@gobus.com

We're here to help!
  `;

  return { subject, html, text };
};
