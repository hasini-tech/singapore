import nodemailer from 'nodemailer';

export async function sendEventCreatedNotifications(event: any, actor: any) {
  try {
    // 1. Send Email using Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_SERVER_PORT) || 587,
      auth: {
        user: process.env.EMAIL_SERVER_USER || 'placeholder@example.com',
        pass: process.env.EMAIL_SERVER_PASSWORD || 'placeholder-password',
      },
    });

    const letterTemplate = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ccc;">
        <h2>Event Created Successfully</h2>
        <p>Dear ${actor?.name || 'Host'},</p>
        <p>Your event <strong>${event.title}</strong> has been successfully created.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li><strong>Date:</strong> ${event.date} at ${event.time}</li>
          <li><strong>Location:</strong> ${event.is_online ? 'Online' : event.location}</li>
          <li><strong>Capacity:</strong> ${event.max_seats === 0 ? 'Unlimited' : event.max_seats}</li>
        </ul>
        <p>Access your event <a href="${event.share_url}">here</a>.</p>
        <br/>
        <p>Best regards,<br/>The GrowthLab Team</p>
      </div>
    `;

    // Fire email async
    transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@growthlab.com',
      to: actor?.email || 'test@example.com',
      subject: `Evently: ${event.title} successfully created!`,
      html: letterTemplate,
    }).catch(e => console.error("Could not send email", e));

    // 2. Send Whatsapp (Stubbed logic for provider)
    const whatsappMessage = `Hello ${actor?.name || 'Host'},\n` + 
      `Your event "${event.title}" on ${event.date} at ${event.time} was created successfully!\n` + 
      `Share link: ${event.share_url}`;
    
    // In production, integrate Meta Whatsapp Business API, Twilio, or another provider here
    console.log("---- WHATSAPP NOTIFICATION TRIGGERED ----");
    console.log("To: User Phone Number");
    console.log("Message:", whatsappMessage);
    console.log("---------------------------------------");

  } catch (error) {
    console.error("Error in sendEventCreatedNotifications:", error);
  }
}
