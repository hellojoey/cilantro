# Cilantro

A calming yes/no reflection app to help you find yourself.

## Quick Deploy to Vercel (Easiest - No Coding Required)

### Option 1: Deploy via GitHub (Recommended)

1. **Create a GitHub account** (if you don't have one)
   - Go to [github.com](https://github.com) and sign up

2. **Upload this folder to GitHub**
   - Click the `+` button in the top right → "New repository"
   - Name it `cilantro`
   - Click "Create repository"
   - Click "uploading an existing file"
   - Drag and drop ALL files from this `cilantro-app` folder
   - Click "Commit changes"

3. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com) and sign up with your GitHub account
   - Click "Add New Project"
   - Select your `cilantro` repository
   - Click "Deploy"
   - Wait ~2 minutes

4. **Done!**
   - Vercel will give you a URL like `cilantro-yourname.vercel.app`
   - Share this link with anyone!

### Option 2: Drag & Drop to Vercel

1. Go to [vercel.com](https://vercel.com) and sign up
2. Drag the entire `cilantro-app` folder onto the Vercel dashboard
3. Wait for deployment
4. Get your live URL!

---

## Run Locally (For Testing)

If you want to test on your computer first:

1. Install Node.js from [nodejs.org](https://nodejs.org) (LTS version)

2. Open Terminal (Mac) or Command Prompt (Windows)

3. Navigate to this folder:
   ```
   cd path/to/cilantro-app
   ```

4. Install dependencies:
   ```
   npm install
   ```

5. Start the app:
   ```
   npm run dev
   ```

6. Open your browser to `http://localhost:5173`

---

## Project Structure

```
cilantro-app/
├── src/
│   ├── Cilantro.jsx    # Main app component
│   ├── main.jsx        # Entry point
│   └── index.css       # Tailwind styles
├── public/
│   └── cilantro.svg    # Favicon
├── index.html          # HTML template
├── package.json        # Dependencies
├── vite.config.js      # Build config
├── tailwind.config.js  # Tailwind config
└── postcss.config.js   # PostCSS config
```

---

## Next Steps After Deployment

1. **Add More Questions**
   - Edit `src/Cilantro.jsx` and add to the `questions` array

2. **Connect Google Sheets** (for easier content management)
   - Use the `cilantro_admin_template.xlsx` file
   - Upload to Google Sheets
   - Enable Google Sheets API
   - Update the app to fetch from your sheet

3. **Add Real User Accounts**
   - Consider using Firebase, Supabase, or Clerk for authentication
   - Store user answers in a database

4. **Custom Domain**
   - In Vercel, go to Settings → Domains
   - Add your own domain like `cilantro.app`

---

## Need Help?

- Vercel Docs: [vercel.com/docs](https://vercel.com/docs)
- React Docs: [react.dev](https://react.dev)
- Tailwind Docs: [tailwindcss.com](https://tailwindcss.com)
