import fs from 'fs';
let code = fs.readFileSync('server.ts', 'utf8');

const oldMediaCleanup = `    const deletedMedia = await prisma.media.findMany({ where: { isDeleted: true } });
    
    const cloudinary = getCloudinary();
    let count = 0;
    for (const m of deletedMedia) {
      try {
        await cloudinary.uploader.destroy(m.publicId);
        await prisma.media.delete({ where: { id: m.id } });
        count++;
      } catch (err) {
        logger.error(\`Failed to delete media \${m.id}\`, err);
      }
    }`;

const newMediaCleanup = `    const deletedMedia = await prisma.media.findMany({ where: { isDeleted: true } });
    
    const cloudinary = getCloudinary();
    let count = 0;
    
    // Process in batches of 10 to avoid rate limits / connection drops
    const batchSize = 10;
    for (let i = 0; i < deletedMedia.length; i += batchSize) {
      const batch = deletedMedia.slice(i, i + batchSize);
      await Promise.all(batch.map(async (m) => {
        try {
          await cloudinary.uploader.destroy(m.publicId);
          await prisma.media.delete({ where: { id: m.id } });
          count++;
        } catch (err) {
          logger.error(\`Failed to delete media \${m.id}\`, err);
        }
      }));
    }`;

if(code.includes(oldMediaCleanup)) {
    code = code.replace(oldMediaCleanup, newMediaCleanup);
    fs.writeFileSync('server.ts', code);
    console.log('Fixed media cleanup');
}
