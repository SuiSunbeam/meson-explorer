export default function Address({}) {
  return <p>WIP</p>
}

export async function getStaticProps() {
  const props = {}
  return { props, revalidate: 10 }
}

export async function getStaticPaths() {
  return { paths: [], fallback: true }
}
