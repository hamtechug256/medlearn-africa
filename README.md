# Medlearn Africa 🩺

East African Nursing Education Platform - A comprehensive digital learning platform for nursing students.

## Features

- 📚 **457+ Nursing Topics** across 6 semesters
- 🎓 **24 Course Units** with intelligent topic matching
- 🔐 **Admin Dashboard** for content management
- 📱 **Responsive Design** for all devices
- 🌙 **Dark/Light Mode** support
- 🖼️ **Image Management** with Supabase Storage

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Supabase account (free tier works)
- GitHub account

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/medlearn-africa.git
   cd medlearn-africa
   ```

2. **Install dependencies**
   ```bash
   bun install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the database schema**
   
   Copy the contents of `supabase-schema.sql` and run it in your Supabase SQL Editor.

5. **Start the development server**
   ```bash
   bun dev
   # or
   npm run dev
   ```

## Admin Panel

Access the admin panel at `/admin/login` to:
- Add, edit, and delete topics
- Manage categories and course units
- Upload and organize images
- Migrate data from JSON files

## Deployment

This project is configured for Vercel deployment:

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

## License

MIT License

## Author

Built with ❤️ for East African nursing education
