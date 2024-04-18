# Telegram bot for notifying if service is Unhealthy

Only IPs from white list can call `/notify`.

Notification will be send to list of chats with id from `CHAT_IDS`.

Example:
```
curl -X POST -H "Content-Type: text/plain" -d "Error" localhost:1339/notify
```

*Body* is MarkdownV2 formated text.

Env variables:

* BOT_TOKEN           - Bot token 
* PORT                - Server port
* UPDATE_INTERVAL     - Interval between updates
* DEBUG               - Enable debug logging
* ALLOWED_IPS         - List of IPs that allowed to call `/notify'
* CHAT_IDs            - List of chat ids that will receive notification

