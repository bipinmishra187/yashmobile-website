
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!token || !chatId) {
      throw new Error("Telegram environment variables are missing");
    }

    const data = JSON.parse(event.body || "{}");

    const getValue = (...keys) => {
  for (const key of keys) {
    const value = Object.entries(data).find(
      ([k, v]) =>
        k.toLowerCase() === key.toLowerCase() &&
        String(v).trim()
    )?.[1];

    if (value !== undefined) return String(value).trim();
  }
  return "Not provided";
};

const message = [
  "🔔 YASH MOBILE - NEW ENQUIRY",
  "",
  "📌 Category: " + getValue("category"),
  "🛠 Service: " + getValue("service", "Service Required", "Choose Service"),
  "👤 Name: " + getValue("name", "Name", "Full Name"),
  "📞 Phone: " + getValue("phone", "Contact Mobile Number", "Mobile"),
  "💻 Brand / Model: " + getValue("brand", "Brand / Model"),
  "💰 Budget: " + getValue("budget", "Budget (optional)"),
  "📝 Details: " + getValue("details", "message", "Issue or Requirements")
].join("\n");

    const response = await fetch(
      "https://api.telegram.org/bot" + token + "/sendMessage",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message
        })
      }
    );

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "Telegram delivery failed" })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unable to send enquiry" })
    };
  }
};
