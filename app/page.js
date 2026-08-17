import Link from "next/link";
import Hero from "@/components/Hero";
import SectionHeading from "@/components/SectionHeading";
import BlogCard from "@/components/BlogCard";
import CategoryGrid from "@/components/CategoryGrid";
import Newsletter from "@/components/Newsletter";
import { getAllPublishedPosts } from "@/lib/posts";
import styles from "./page.module.css";

export default async function HomePage() {
  const allPosts = await getAllPublishedPosts();

  if (allPosts.length === 0) {
    return (
      <section className={`container ${styles.emptyState}`}>
        <p className={styles.emptyEyebrow}>The publication is warming up</p>
        <SectionHeading eyebrow="Nothing published yet" title="No blogs to show" />
        <p className={styles.emptyCopy}>
          Once an article is approved and published from the <Link href="/admin">admin panel</Link>, it will appear here.
        </p>
      </section>
    );
  }

  const featured = allPosts.filter((post) => post.featured);
  const [lead, ...restFeatured] = featured.length > 0 ? featured : allPosts;
  const featuredSlugs = new Set((featured.length > 0 ? featured : [lead]).map((post) => post.slug));
  const latest = allPosts.filter((post) => !featuredSlugs.has(post.slug)).slice(0, 6);

  const authorCounts = {};
  for (const post of allPosts) {
    if (authorCounts[post.author.name]) {
      authorCounts[post.author.name].count += 1;
    } else {
      authorCounts[post.author.name] = { ...post.author, count: 1 };
    }
  }
  const topAuthors = Object.values(authorCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const avatarColors = ["#332e8c", "#c57e22", "#1f6e3e", "#942c2c"];
  function getInitials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  return (
    <>
      <Hero lead={lead} />

      <section className={`container ${styles.section}`} id="featured">
        <SectionHeading
          eyebrow="Editor's picks"
          title="Ideas worth your time"
          action={{ href: "/blogs", label: "View all blogs" }}
        />
        <div className={styles.featuredGrid}>
          {restFeatured.map((post) => (
            <BlogCard key={post.slug} post={post} variant="featured" />
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`}>
        <SectionHeading
          eyebrow="Just published"
          title="The latest signal"
          action={{ href: "/blogs", label: "Browse all" }}
        />
        <div className={styles.cardGrid}>
          {latest.map((post) => (
            <BlogCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      <section className={`container ${styles.section}`} id="categories">
        <SectionHeading eyebrow="Browse by topic" title="Find your next deep dive" />
        <CategoryGrid />
      </section>

      <section className={`container ${styles.section} ${styles.authorsSection}`}>
        <div className={styles.authorsHeader}>
          <div>
            <p className={styles.sectionEyebrow}>The people behind the signal</p>
            <h2 className={styles.authorsTitle}>Meet our authors</h2>
          </div>
        </div>
        <div className={styles.authorStack}>
          {topAuthors.map((author, index) => (
            <div
              key={author.name}
              className={styles.authorStackItem}
              style={{ zIndex: topAuthors.length - index }}
              title={`${author.name} — ${author.count} published article${author.count === 1 ? "" : "s"}`}
            >
              <span
                className={styles.authorAvatar}
                style={{ background: avatarColors[index % avatarColors.length] }}
                aria-hidden="true"
              >
                {getInitials(author.name)}
              </span>
              <span className={styles.authorStackName}>{author.name}</span>
            </div>
          ))}
        </div>
        <p className={styles.authorCta}>
          Have a useful perspective to share? <Link href="/register" className={styles.authorCtaLink}>Join the contributor network</Link>
        </p>
      </section>

      <Newsletter />
    </>
  );
}
