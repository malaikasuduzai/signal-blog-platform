// components/Hero.jsx
import Image from "next/image";
import Link from "next/link";
import CategoryPill from "./CategoryPill";
import styles from "./Hero.module.css";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Hero({ lead }) {
  return (
    <section className={styles.hero}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>DISCOVER • READ • SHARE • PUBLISH</p>
          <h1 className={styles.headline}>
            Clear thinking on <em>technology</em> and the work behind it.
          </h1>
          <p className={styles.sub}>
            Practical essays on web development, AI, cybersecurity, and product craft — written for people who make things.
          </p>
          <div className={styles.heroActions}>
            <Link href="/blogs" className={styles.exploreButton}>
              Explore Blogs
            </Link>
            <Link href="/search" className={styles.searchButton}>
              <svg width="15" height="15" viewBox="0 0 18 18" fill="none" aria-hidden="true">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M16 16L12.5 12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              Search articles
            </Link>
          </div>

        </div>

        <Link href={`/blogs/${lead.slug}`} className={styles.leadCard}>
          <div className={styles.leadImageWrap}>
            <Image
              src={lead.image}
              alt={lead.title}
              fill
              sizes="(max-width: 900px) 100vw, 560px"
              className={styles.leadImage}
              priority
            />
          </div>
          <div className={styles.leadBody}>
            <CategoryPill slug={lead.category} asLink={false} />
            <h2 className={styles.leadTitle}>{lead.title}</h2>
            <p className={styles.leadMeta}>
              {lead.author.name} · {formatDate(lead.date)} · {lead.readingTime} min read
            </p>
          </div>
        </Link>
      </div>
    </section>
  );
}
