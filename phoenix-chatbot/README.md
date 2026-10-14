# Phoenix chatbot - setup
1. Fill every null/empty field in tours.json (prices, includes, pickup, policies).
2. Copy .env.example to .env (or set the same variables in Hostinger's Node.js app settings).
3. `npm install` then `npm start` (Hostinger: set startup file to server.js).
4. Add to every page, before </body>:
   <script src="/chatbot/chat-widget.js" defer></script>
5. Test: ask for a price, then book a tour; check the email arrives.
6. Set up SPF/DKIM for the domain so emails do not go to spam.
