# Add the chatbot to the EXISTING site (do not replace server.js)
1. Copy `chatbot.js`, `tours.json` and the `public/` folder contents into your site project
   (public/chat-widget.js goes in a folder named `public` next to chatbot.js, or adjust the path in chatbot.js).
2. Install: npm i @anthropic-ai/sdk dotenv express-rate-limit nodemailer
3. In your existing server.js, after `const app = express();` add:
       app.set('trust proxy', 1);
       app.use(require('./chatbot'));
4. Set the environment variables from .env.example in Hostinger (Node.js app settings).
5. Add before </body> on your pages:
       <script src="/chatbot/chat-widget.js" defer></script>
6. Restart the Node.js app.
