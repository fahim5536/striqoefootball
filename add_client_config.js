import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const clientConfigRoute = `
app.get("/api/client-config", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // 1. Get all active feature flags
    const flags = await prisma.featureFlag.findMany();
    const activeFlags = flags.reduce((acc, flag) => {
      // Logic: If flag is globally enabled, true.
      // If flag is enabled for a specific role (e.g. BETA_TESTER, ADMIN)
      // Check user role.
      let enabled = flag.isEnabled;
      
      // If there's a roles array (Assuming we added simple logic for it, or just use flag.isEnabled for now)
      // Since our schema might not have complex arrays for roles natively, we just check isEnabled.
      
      acc[flag.key] = enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    // 2. Get remote configs
    const configs = await prisma.remoteConfig.findMany();
    const configValues = configs.reduce((acc, config) => {
      acc[config.key] = config.value;
      return acc;
    }, {} as Record<string, any>);
    
    // 3. Get active experiments
    const experiments = await prisma.experiment.findMany({
      where: { status: 'ACTIVE' }
    });
    
    // For a real app we'd assign variants based on user ID hash, but for now just return active ones
    const activeExperiments = experiments.reduce((acc, exp) => {
      acc[exp.key] = exp; // The frontend will handle variant assignment or we can do it here
      return acc;
    }, {} as Record<string, any>);

    res.json({
      featureFlags: activeFlags,
      remoteConfig: configValues,
      experiments: activeExperiments
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

`;

code = code.replace(`app.get("/api/:collection",`, clientConfigRoute + `app.get("/api/:collection",`);
fs.writeFileSync('server.ts', code);
console.log("Added /api/client-config");
