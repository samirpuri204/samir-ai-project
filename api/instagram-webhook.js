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
    console.log("WEBHOOK BODY:");
    console.log(JSON.stringify(req.body, null, 2));

    const event = req.body?.entry?.[0]?.messaging?.[0];

    if (event) {
      console.log("REAL IGSID:", event.sender?.id);
      console.log("MESSAGE:", event.message?.text);
    }

    return res.status(200).send("EVENT_RECEIVED");
  }

  return res.status(405).send("Method Not Allowed");
}
