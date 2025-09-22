# Fashion App (Inventory)

Fullstack app with **React + Vite** (frontend) & **Express + Prisma** (backend), with **JWT** authentication and API communication **Axios**.

---

## Installation & Setup

### Clone repository
```bash
git clone https://github.com/Dxote/Inventory-Fashion-App.git
cd Inventory-Fashion-App
```

### Setup Database
```bash
createdb -U postgres db_fashion
psql -U postgres -d db_fashion -f ./db_fashion.sql
```

## Environment Variables
```
DATABASE_URL=postgresql://user:password@localhost:5432/inventorydb
JWT_SECRET=supersecret
PORT=4000
VITE_API_URL=http://localhost:4000
```

---

### Installation
```bash
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```
---

## Prisma Commands

```bash
npx prisma migrate dev
npx prisma generate
npx prisma studio
```

---

## Documentation

- [Trello Board](https://trello.com/b/UWUJMF7G/fashion-app-inventory)
