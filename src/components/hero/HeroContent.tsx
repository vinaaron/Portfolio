import styles from "./Hero.module.css";

export function HeroContent() {
  return (
    <div className={styles.content}>
      <h1 className={styles.headline}>
        AARON
        <br />
        VINOD
      </h1>
      <p className={styles.role}>Engineer & Founder</p>
      <p className={styles.subtitle}>
        Product engineer shipping full-stack with an agent-first workflow. Founder of ScrollBuddy, live on the App Store.
      </p>
    </div>
  );
}
