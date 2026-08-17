// One-off patch: updates the cover image + inline content image for the
// "Server-Side Rendering, Static Generation, and Incremental Regeneration
// Compared" post, replacing the mismatched portrait photo with a relevant
// code-on-screen photo. Safe to run against an already-seeded database —
// it only touches this one row.
//
// Usage:
//   node scripts/fix-rendering-image.js

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const OLD_ID = "1526379879527-8559ecfcaec0";
const NEW_ID = "1619410283995-43d9134e7656"; // code editor showing React source

const img = (id, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&auto=format&fit=crop&q=60`;

async function main() {
  const post = await prisma.blog.findUnique({
    where: { slug: "rendering-strategies-web" },
  });

  if (!post) {
    console.log("Post with slug 'rendering-strategies-web' not found.");
    return;
  }

  const newFeaturedImage = img(NEW_ID);

  const newContent = Array.isArray(post.content)
    ? post.content.map((block) =>
        block.type === "image" && block.src && block.src.includes(OLD_ID)
          ? { ...block, src: img(NEW_ID, 1200) }
          : block
      )
    : post.content;

  await prisma.blog.update({
    where: { slug: "rendering-strategies-web" },
    data: {
      featuredImage: newFeaturedImage,
      content: newContent,
    },
  });

  console.log("Updated cover + inline image for 'rendering-strategies-web'.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
