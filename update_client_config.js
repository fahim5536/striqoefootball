import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const updatedConfigLogic = `
app.get("/api/client-config", requireAuth, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // 1. Get all active feature flags
    const flags = await prisma.featureFlag.findMany();
    const activeFlags = flags.reduce((acc, flag) => {
      let enabled = flag.isEnabled;
      
      // Feature flag evaluation engine
      if (enabled) {
        if (flag.type === 'ROLE') {
          // Check if user has required role
          try {
            const conditions = JSON.parse(flag.conditions || '{}');
            if (conditions.roles && Array.isArray(conditions.roles)) {
              enabled = conditions.roles.includes(user.role);
            }
          } catch (e) {
            console.error("Failed to parse conditions for flag:", flag.key);
          }
        } else if (flag.type === 'USER') {
          // Check if user ID is in list
          try {
            const conditions = JSON.parse(flag.conditions || '{}');
            if (conditions.userIds && Array.isArray(conditions.userIds)) {
              enabled = conditions.userIds.includes(user.id);
            }
          } catch (e) {
            console.error("Failed to parse conditions for flag:", flag.key);
          }
        }
        // TOURNAMENT type could be evaluated on the client or passed down
      }
      
      acc[flag.key] = enabled;
      return acc;
    }, {} as Record<string, boolean>);
    
    // 2. Get remote configs
    const configs = await prisma.remoteConfig.findMany();
    const configValues = configs.reduce((acc, config) => {
      // Basic target checking
      let value = config.value;
      
      // If there's JSON string in config.value, parse it, if it's meant to be an object
      // For now we just return the raw string or try to parse if it's valid JSON
      try {
         // See if value is JSON
         if ((value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'))) {
             value = JSON.parse(value);
         }
      } catch (e) {}
      
      acc[config.key] = value;
      return acc;
    }, {} as Record<string, any>);
    
    // 3. Get active experiments
    const experiments = await prisma.experiment.findMany({
      where: { status: 'ACTIVE' }
    });
    
    const activeExperiments = experiments.reduce((acc, exp) => {
      // Deterministic variant assignment based on user.id (pseudo-random)
      try {
          const variants = JSON.parse(exp.variants);
          if (variants && variants.length > 0) {
              // hash user ID to pick variant
              const hash = user.id.split('').reduce((a: number, b: string) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
              const index = Math.abs(hash) % variants.length;
              acc[exp.key] = variants[index].id || variants[index].name || variants[index];
          }
      } catch (e) {
          acc[exp.key] = 'control';
      }
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

code = code.replace(/app\.get\("\/api\/client-config", requireAuth, async \(req, res\) => \{[\s\S]*?res\.json\(\{\n      featureFlags: activeFlags,\n      remoteConfig: configValues,\n      experiments: activeExperiments\n    \}\);\n  \} catch \(e: any\) \{\n    res\.status\(500\)\.json\(\{ error: e\.message \}\);\n  \}\n\}\);/, updatedConfigLogic.trim());

fs.writeFileSync('server.ts', code);
console.log("Updated config engine");
