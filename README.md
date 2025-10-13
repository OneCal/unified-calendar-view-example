# 🗓️ Unified Calendar View Example

This example application demonstrates how to use the **OneCal Unified Calendar API** and explore its key features in an unified calendar interface.

---

## ⚙️ Prerequisites

Before you begin, make sure you have the following installed on your system:

- **[Node.js](https://nodejs.org/)** (v22 or later recommended)
- **[pnpm](https://pnpm.io/)** (v9 or later)
- **[PostgreSQL](https://www.postgresql.org/)** (running locally or remotely)
- **OpenSSL** (for generating secure secrets)

---

## 🚀 Setup Instructions

### 1. Install dependencies

Run `pnpm install` to install all required dependencies.

### 2. Update your environment variables

Create a `.env` file in the project root following the `.env.example` and update the following values.

#### 🔐 Authentication secret  
Used by the authentication layer for signing tokens securely.  
You can generate it with the command `openssl rand -base64 32`.

```bash
BETTER_AUTH_SECRET=<generated-secret>
```

#### 🔑 Google credentials  
Used for enabling Google login and calendar access.  
If not applicable, use dummy values.

```bash
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
```

#### 🔑 Microsoft credentials  
Used for enabling Microsoft login and calendar access.  
If not applicable, use dummy values.

```bash
MICROSOFT_TENANT_ID=<your-tenant-id>
MICROSOFT_CLIENT_ID=<your-microsoft-client-id>
MICROSOFT_CLIENT_SECRET=<your-microsoft-client-secret>
```


#### 🌐 OneCal Unified configuration  
Used to connect the app to your OneCal Unified Calendar instance. You can retrieve your OneCal Unified App ID and create the API key from the [OneCal Unified Dashboard](https://app.onecalunified.com/). You can visit the [OneCal Unified Calendar API Docs](https://docs.onecalunified.com/) to learn more about configuring OneCal Unified.

```bash
NEXT_PUBLIC_ONECAL_UNIFIED_URL="https://api.onecalunified.com"
NEXT_PUBLIC_ONECAL_UNIFIED_APP_ID=<your-onecal-unified-app-id>
ONECAL_UNIFIED_API_KEY=<your-onecal-unified-api-key>
```

#### 🗄️ Database connection  
Defines the PostgreSQL connection for your local or remote database.

```bash
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/unified-calendar-view-example"
```

### 3. Generate Prisma client and apply migrations

This step generates the Prisma client for database access.

```bash
pnpm db:generate
pnpm db:migrate
```

### 5. Start the development server

Start the application locally by running `pnpm dev`.

---

## 🧭 Explore the App

Once the app is running, you can:

- Open **[http://localhost:3000](http://localhost:3000)** to view the dashboard  
- **Log in** using your Google or Microsoft account  
- **Connect** your calendar accounts from the sidebar menu
- **View your events** in daily, weekly, and monthly calendar views  
- **Create events** from the sidebar menu or by clicking on calendar slots  
- **Update or delete events** from the options menu that pops up when clicking on an event  

---

## 🧩 Summary of Key Commands

| Task | Command |
|------|----------|
| Install dependencies | `pnpm install` |
| Generate Prisma client | `pnpm db:generate` |
| Apply migrations | `pnpm db:migrate` |
| Start development server | `pnpm dev` |
