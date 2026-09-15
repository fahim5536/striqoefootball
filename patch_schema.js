import fs from 'fs';

let schema = fs.readFileSync('prisma/schema.prisma', 'utf8');

// Add BetaInvitation model
if (!schema.includes('model BetaInvitation')) {
  const betaModel = `
model BetaInvitation {
  id          String   @id @default(uuid())
  code        String   @unique
  maxUses     Int      @default(1)
  uses        Int      @default(0)
  expiresAt   DateTime?
  status      String   @default("ACTIVE") // ACTIVE, REVOKED
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
`;
  schema += betaModel;
}

// Add beta fields to User
if (!schema.includes('isBetaUser')) {
  schema = schema.replace(
    /role\s+Role\s+@default\(PLAYER\)/,
    `role   Role          @default(PLAYER)\n  isBetaUser Boolean @default(false)\n  betaCodeUsed String?`
  );
}

fs.writeFileSync('prisma/schema.prisma', schema);
