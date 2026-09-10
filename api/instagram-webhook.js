export default async function handler(req, res) {
  if (req.method === "GET") {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (
      mode === "subscribe" &&
      token === process.env.INSTAGRAM_VERIFY_TOKEN
    ) {
      return res.status(200).send(challenge);
    }

    return res.status(403).send("Verification failed");
  }

  if (req.method === "POST") {
    console.log("FULL WEBHOOK:", JSON.stringify(req.body, null, 2));

    try {
      for (const entry of req.body.entry || []) {
        for (const event of entry.messaging || []) {

          console.log("EVENT:", JSON.stringify(event, null, 2));

          if (event.message?.is_echo) continue;

          const senderId = event.sender?.id;
          const text = event.message?.text;

          console.log("SENDER ID:", senderId);
          console.log("MESSAGE:", text);

          if (!senderId || !text) continue;

          const response = await fetch(
            "https://graph.instagram.com/v26.0/me/messages",
            {
              method: "POST",
              headers: {
                Authorization:
                  `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`,
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                recipient: {
                  id: senderId
                },
                message: {
                  text: "✅ Instagram bot is working!"
                }
              })
            }
          );

          const result = await response.json();

          console.log("INSTAGRAM SEND STATUS:", response.status);
          console.log("INSTAGRAM SEND RESULT:", result);
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error("WEBHOOK ERROR:", error);

      return res.status(200).send("EVENT_RECEIVED");
    }
  }

  return res.status(405).send("Method not allowed");
}
