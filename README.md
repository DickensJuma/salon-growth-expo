# Salon Growth Summit

A modern web application for managing salon services, bookings, and payments with Paystack integration.

## Features

- 💳 Secure payment processing with Paystack
- 🎨 Modern, responsive UI with dark mode support
- ⚡ Optimized performance with Next.js
- 🔒 Secure environment variable handling
- 📊 Built-in analytics and monitoring

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Paystack account (for payment processing)

### Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.local.example .env.local
   ```

2. Update the `.env.local` file with your Paystack API keys and other configuration:

   ```env
   # Paystack Configuration
   PAYSTACK_SECRET_KEY=your_secret_key_here
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_public_key_here

   # Application Configuration
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   ```

3. Get your Paystack API keys from the [Paystack Dashboard](https://dashboard.paystack.com/#/settings/developer)

### Installation

1. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

2. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

| Variable                          | Description                  | Required                            |
| --------------------------------- | ---------------------------- | ----------------------------------- |
| `PAYSTACK_SECRET_KEY`             | Your Paystack secret key     | Yes                                 |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Your Paystack public key     | Yes                                 |
| `NEXT_PUBLIC_BASE_URL`            | Base URL of your application | No (default: http://localhost:3000) |

## Deployment

### Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Fsalon-growth-expo&env=PAYSTACK_SECRET_KEY,NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY&envDescription=Required%20environment%20variables%20for%20Paystack%20integration&envLink=https%3A%2F%2Fgithub.com%2Fyourusername%2Fsalon-growth-expo%2Fblob%2Fmain%2F.env.local.example)

### Manual Deployment

1. Build the application:

   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm start
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/671912a8-578e-4dcd-b0bc-ba0cf315d67d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/671912a8-578e-4dcd-b0bc-ba0cf315d67d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
