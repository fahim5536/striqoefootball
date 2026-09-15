import fs from 'fs';

let code = fs.readFileSync('server.ts', 'utf8');

const securityCheck = `
    const existing = await model.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ error: "Not found" });

    // Authorization check
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
      let isOwner = false;
      if (req.params.collection === 'users' && existing.id === req.user.id) isOwner = true;
      else if (existing.userId && existing.userId === req.user.id) isOwner = true;
      else if (existing.ownerId && existing.ownerId === req.user.id) isOwner = true;
      else if (req.params.collection === 'teams' && existing.captainId === req.user.id) isOwner = true;
      else if (req.params.collection === 'tournaments' && existing.organizerId === req.user.id) isOwner = true;

      if (!isOwner) {
        return res.status(403).json({ error: "Forbidden: You do not own this resource." });
      }
    }
`;

code = code.replace(
  `const model = getModel(req.params.collection);
    if (!model) return res.status(404).json({ error: "Not found" });
    // Remove id from body to avoid update errors`,
  `const model = getModel(req.params.collection);
    if (!model) return res.status(404).json({ error: "Not found" });
${securityCheck}
    // Remove id from body to avoid update errors`
);

code = code.replace(
  `const model = getModel(req.params.collection);
    if (!model) return res.status(404).json({ error: "Not found" });
    await model.delete({ where: { id: req.params.id } });`,
  `const model = getModel(req.params.collection);
    if (!model) return res.status(404).json({ error: "Not found" });
${securityCheck}
    await model.delete({ where: { id: req.params.id } });`
);

fs.writeFileSync('server.ts', code);
