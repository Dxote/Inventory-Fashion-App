import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.create({
    data: {
      name: "Test Prisma",
      email: "prisma@mail.com",
      password: "hashedpass",
      role: "ADMIN",
      profileImageUrl: "http://localhost:4000/uploads/test.png",
    },
  });
  console.log(user);
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
