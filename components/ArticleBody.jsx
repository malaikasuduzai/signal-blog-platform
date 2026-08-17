// components/ArticleBody.jsx
import Image from "next/image";
import styles from "./ArticleBody.module.css";

export default function ArticleBody({ blocks }) {
  return (
    <div className={styles.body}>
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          return (
            <h2 key={i} className={styles.heading}>
              {block.text}
            </h2>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote key={i} className={styles.quote}>
              {block.text}
            </blockquote>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={i} className={styles.figure}>
              <div className={styles.figureImageWrap}>
                <Image
                  src={block.src}
                  alt={block.alt}
                  fill
                  sizes="(max-width: 760px) 100vw, 700px"
                  className={styles.figureImage}
                />
              </div>
              {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
            </figure>
          );
        }
        return (
          <p key={i} className={styles.paragraph}>
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
