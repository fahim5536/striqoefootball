import fs from 'fs';

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

if (!schema.includes('model ErrorLog')) {
  const errorModel = `
model ErrorLog {
  id          String   @id @default(uuid())
  message     String   @db.Text
  stack       String?  @db.Text
  route       String?
  method      String?
  userId      String?
  level       String   @default("ERROR") // ERROR, CRITICAL, FATAL
  count       Int      @default(1)
  resolved    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([createdAt])
  @@index([level])
}
`;
  schema += errorModel;
  fs.writeFileSync('prisma/schema.prisma', schema);
}
