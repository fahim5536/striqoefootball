import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldLoop = `      else {
        for (const p of match.participants) {
          if (p.teamId) {
            const teamMember = await prisma.teamMember.findUnique({
              where: { teamId_userId: { teamId: p.teamId, userId: req.user.id } }
            });
            if (teamMember) {
              isAuthorized = true;
              break;
            }
          }
        }
      }`;

const newLoop = `      else {
        const teamIds = match.participants.map((p: any) => p.teamId).filter(Boolean);
        if (teamIds.length > 0) {
          const teamMemberCount = await prisma.teamMember.count({
            where: {
              userId: req.user.id,
              teamId: { in: teamIds }
            }
          });
          if (teamMemberCount > 0) {
            isAuthorized = true;
          }
        }
      }`;

code = code.replace(oldLoop, newLoop);
fs.writeFileSync('server.ts', code);
console.log('Fixed match auth loop');
