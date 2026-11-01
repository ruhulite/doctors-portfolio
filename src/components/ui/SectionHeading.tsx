type Props = { eyebrow?: string; title: string; description?: string; centered?: boolean };
export function SectionHeading({ eyebrow, title, description, centered = false }: Props) {
  return <div className={`mb-9 max-w-2xl ${centered ? "mx-auto text-center" : ""}`}>
    {eyebrow && <p className="mb-3 text-xs font-bold uppercase tracking-[.18em] text-teal">{eyebrow}</p>}
    <h2 className="text-3xl font-bold tracking-tight text-ink md:text-4xl">{title}</h2>
    {description && <p className="mt-3 text-sm leading-7 text-muted">{description}</p>}
  </div>;
}