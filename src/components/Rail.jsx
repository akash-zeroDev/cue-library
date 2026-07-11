export default function Rail({ title, seeAll, columns = 3, children }) {
  return (
    <section className="rail" aria-label={title}>
      <header className="rail-head">
        <h2 className="rail-title">{title}</h2>
        {seeAll && <a className="rail-see" href={seeAll}>See all →</a>}
      </header>
      <div className={`grid grid-${columns}`}>{children}</div>
    </section>
  )
}
