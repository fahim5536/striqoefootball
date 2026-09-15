import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const betaAuthLogic = `
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, username, betaCode } = req.body;
    
    // Check if beta restriction is enabled via feature flag
    const betaFlag = await prisma.featureFlag.findUnique({ where: { key: 'BETA_ONLY' } });
    const isBetaOnly = betaFlag?.isEnabled ?? true; // Default to true for closed beta

    let betaInvite = null;
    if (isBetaOnly) {
      if (!betaCode) {
        return res.status(403).json({ error: "A valid beta invitation code is required for registration." });
      }
      
      betaInvite = await prisma.betaInvitation.findUnique({ where: { code: betaCode } });
      if (!betaInvite) {
        return res.status(403).json({ error: "Invalid beta code." });
      }
      if (betaInvite.status !== 'ACTIVE') {
        return res.status(403).json({ error: "This beta code has been revoked or is inactive." });
      }
      if (betaInvite.expiresAt && new Date() > betaInvite.expiresAt) {
        return res.status(403).json({ error: "This beta code has expired." });
      }
      if (betaInvite.uses >= betaInvite.maxUses) {
        return res.status(403).json({ error: "This beta code has reached its maximum number of uses." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, config.auth.bcryptRounds);
    
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        username: username || email.split('@')[0],
        isBetaUser: isBetaOnly ? true : false,
        betaCodeUsed: betaCode || null,
      }
    });

    // Update beta invite usage
    if (betaInvite) {
      await prisma.betaInvitation.update({
        where: { id: betaInvite.id },
        data: { uses: { increment: 1 } }
      });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: config.auth.jwtExpiresIn as any });
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: config.auth.jwtRefreshExpiresIn as any });
    
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.server.env === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
    res.json({ token, user });
  } catch (e: any) {
    logger.error("Registration error:", e);
    res.status(400).json({ error: e.message });
  }
});
`;

code = code.replace(/app\.post\("\/api\/auth\/register", async \(req, res\) => \{[\s\S]*?(?=app\.post\("\/api\/auth\/login",)/, betaAuthLogic);

const adminBetaRoutes = `
// ==========================================
// BETA MANAGEMENT API
// ==========================================

app.get("/api/admin/beta/invitations", requireAuth, requireAdmin, async (req, res) => {
  try {
    const invites = await prisma.betaInvitation.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(invites);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/beta/invitations", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const { code, maxUses, expiresAt } = req.body;
    const invite = await prisma.betaInvitation.create({
      data: {
        code: code || Math.random().toString(36).substring(2, 10).toUpperCase(),
        maxUses: maxUses || 1,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: req.user.id
      }
    });
    res.json(invite);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/beta/invitations/:id/revoke", requireAuth, requireAdmin, async (req, res) => {
  try {
    const invite = await prisma.betaInvitation.update({
      where: { id: req.params.id },
      data: { status: 'REVOKED' }
    });
    res.json(invite);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/admin/beta/users", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { isBetaUser: true },
      select: { id: true, email: true, username: true, status: true, betaCodeUsed: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/beta/users/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: "User not found" });
    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { isBetaUser: !user.isBetaUser }
    });
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

`;

code = code.replace('// Users\napp.get("/api/admin/users"', adminBetaRoutes + '// Users\napp.get("/api/admin/users"');

fs.writeFileSync('server.ts', code);
