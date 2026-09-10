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
    try {
      const body = req.body;

      if (body.object !== "instagram") {
        return res.status(404).end();
      }

      for (const entry of body.entry || []) {
        for (const event of entry.messaging || []) {
          const senderId = event.sender?.id;
          const message = event.message;

          if (!senderId || !message?.text || message?.is_echo) {
            continue;
          }

          const text = message.text.trim();

          console.log("Instagram DM:", senderId, text);

          await sendInstagramMessage(
            senderId,
            `You said: ${text}`
          );
        }
      }

      return res.status(200).send("EVENT_RECEIVED");
    } catch (error) {
      console.error(error);
      return res.status(200).send("EVENT_RECEIVED");
    }
  }

  return res.status(405).end();
}

async function sendInstagramMessage(userId, text) {
  const response = await fetch(
    "https://graph.instagram.com/v26.0/me/messages",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.INSTAGRAM_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: {
          id: userId,
        },
        message: {
          text,
        },
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("Instagram API error:", data);
  }

  return data;
}
