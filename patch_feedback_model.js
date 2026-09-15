import fs from 'fs';

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

schema = schema.replace(
  /model Feedback \{[\s\S]*?updatedAt\s+DateTime\s+@updatedAt/m,
  "model Feedback {\n" +
  "  id          String   @id @default(uuid())\n" +
  "  userId      String?\n" +
  "  type        String   @default(\"GENERAL\")\n" +
  "  category    String?\n" +
  "  content     String   @db.Text\n" +
  "  status      String   @default(\"OPEN\")\n" +
  "  priority    String?  @default(\"MEDIUM\")\n" +
  "  severity    String?  @default(\"MINOR\")\n" +
  "  adminNotes  String?  @db.Text\n" +
  "  duplicateOf String?\n" +
  "  screenshots String?  @db.Text\n" +
  "  metadata    String?  @db.Text\n" +
  "  createdAt   DateTime @default(now())\n" +
  "  updatedAt   DateTime @updatedAt"
);

fs.writeFileSync('prisma/schema.prisma', schema);
