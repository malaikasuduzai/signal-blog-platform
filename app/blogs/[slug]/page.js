// app/blogs/[slug]/page.js
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryPill from "@/components/CategoryPill";
import AuthorAvatar from "@/components/AuthorAvatar";
import ArticleBody from "@/components/ArticleBody";
import ShareBar from "@/components/ShareBar";
import RelatedBlogs from "@/components/RelatedBlogs";
import PrevNextNav from "@/components/PrevNextNav";
import { getAllPublishedPosts, getPost, getRelatedPosts, getAdjacentPosts } from "@/lib/posts";
import styles from "./blogDetails.module.css";

export async function generateStaticParams() {
  const posts = await getAllPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return {};

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blogs/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      url: `/blogs/${post.slug}`,
      images: [{ url: post.image }],
      authors: [post.author.name],
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default async function BlogDetailsPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);
  const { prev, next } = await getAdjacentPosts(post.slug);

  return (
    <article className={styles.page}>
      <header className={`container ${styles.header}`}>
        <div className={styles.breadcrumb}>
          <Link href="/blogs">Blogs</Link>
          <span aria-hidden="true">/</span>
          <CategoryPill slug={post.category} size="sm" />
        </div>

        <h1 className={styles.title}>{post.title}</h1>
        <p className={styles.excerpt}>{post.excerpt}</p>

        <div className={styles.byline}>
          <AuthorAvatar name={post.author.name} size={40} className={styles.avatar} />
          <div>
            <p className={styles.authorName}>{post.author.name}</p>
            <p className={styles.meta}>
              {formatDate(post.date)} · {post.readingTime} min read
            </p>
          </div>
        </div>
      </header>

      <div className={`container ${styles.heroImageWrap}`}>
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(max-width: 1100px) 100vw, 1100px"
          className={styles.heroImage}
          priority
        />
      </div>

      <div className={`container ${styles.layout}`}>
        <div className={styles.main}>
          <ArticleBody blocks={post.content} />

          {post.references?.length > 0 && (
            <section className={styles.references} aria-label="References">
              <h2 className={styles.referencesTitle}>References</h2>
              <ul>
                {post.references.map((ref) => (
                  <li key={ref.url}>
                    <a href={ref.url} target="_blank" rel="noopener noreferrer">
                      {ref.title}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <ShareBar title={post.title} path={`/blogs/${post.slug}`} />

          <div className={styles.authorBox}>
            <AuthorAvatar name={post.author.name} size={56} className={styles.authorBoxAvatar} />
            <div>
              <p className={styles.authorBoxName}>Written by {post.author.name}</p>
              <p className={styles.authorBoxBio}>{post.author.bio}</p>
            </div>
          </div>

          <PrevNextNav prev={prev} next={next} />
        </div>

        <div className={styles.sidebar}>
          <RelatedBlogs posts={related} />
        </div>
      </div>
    </article>
  );
}
