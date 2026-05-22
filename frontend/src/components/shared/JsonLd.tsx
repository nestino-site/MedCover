interface JsonLdProps {
  schema: unknown
}

export function JsonLd({ schema }: JsonLdProps) {
  if (schema === null || schema === undefined) return null

  const entries = Array.isArray(schema) ? schema : [schema]

  return (
    <>
      {entries.map((entry, index) => (
        <script
          key={index}
          type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(entry) }}
        />
      ))}
    </>
  )
}
