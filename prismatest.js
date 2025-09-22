import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const allUsers = await prisma.user.findMany(); // ganti dengan tabel yang ada
  console.log(allUsers);
}

main().catch(e => console.error(e));
