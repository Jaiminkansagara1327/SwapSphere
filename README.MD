# 🔄 SwapSphere

**SwapSphere** is a full-stack peer-to-peer marketplace for exchanging, selling, and discovering unused **gift cards, vouchers, and coupons**. It provides a secure platform where users can create listings, send swap requests, communicate with other users, and build trust through reviews and verification.

## 🚀 Live Demo

**[Visit SwapSphere](https://swapsphere-app.vercel.app/dashboard)**

## ✨ Features

* 👤 User authentication & profiles
* 🛍️ Gift card, voucher & coupon listings
* 🔄 Buy, sell & swap functionality
* 💬 User-to-user chat
* 🔐 Verification & trust score
* 💰 Escrow functionality
* ⭐ Reviews & ratings
* 🔔 Notifications
* 🎁 Referral system
* 🛠️ Admin dashboard & management
* 📊 Marketplace analytics

## 🛠️ Tech Stack

* **Next.js 16**
* **React 19**
* **TypeScript**
* **Tailwind CSS 4**
* **MongoDB**
* **Prisma ORM**
* **Clerk Authentication**
* **Zustand**
* **Axios**
* **Framer Motion**
* **Recharts**
* **Lucide React**
* **Vercel**

## 🏗️ Architecture

```text
Next.js + React
      ↓
Next.js API
      ↓
Prisma ORM
      ↓
MongoDB
```

**Authentication:** Clerk

## 🗄️ Main Database Models

`Profile` • `Item` • `SwapRequest` • `Message` • `EscrowDeposit` • `Review` • `Notification` • `Referral` • `Category` • `Brand`

## ⚡ Getting Started

### 1. Frontend & API Setup

```bash
git clone https://github.com/Jaiminkansagara1327/SwapSphere.git
cd SwapSphere/frontend
npm install
npm run dev
```

Create your `.env` file with the required database and Clerk credentials before running the application.

### 2. Running Pytest Suite

```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
pytest -v --cov=tests
```

## 🧪 Automated Testing & CI

SwapSphere uses **Pytest** for business logic, validation, escrow rules, and API contract testing, automated via **GitHub Actions** (`.github/workflows/ci.yml`):

* 🧪 **Pytest Suite:** 50+ unit and integration tests covering object ID parsing, escrow state machines, price bounds, swap lifecycles, and admin permissions.
* 🤖 **Continuous Integration:** Matrix testing across Python 3.11 & 3.12, plus automated ESLint & Prisma validation on all pushes and pull requests.

## 📌 Project Goal

SwapSphere aims to **reduce unused gift cards and vouchers by connecting people who want to sell, buy, or exchange them through a trusted peer-to-peer marketplace.**

## 🔗 Links

* 🌐 **Live:** [swapsphere-app.vercel.app](https://swapsphere-app.vercel.app/dashboard)
* 💻 **GitHub:** [github.com/Jaiminkansagara1327/SwapSphere](https://github.com/Jaiminkansagara1327/SwapSphere)

## 📄 License

**GNU GPL v3.0**
