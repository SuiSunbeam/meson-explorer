export default function Home({ swaps, error }) {
  if (error) {
    return <p>{error}</p>
  } else if (!swaps) {
    return 'loading...'
  }
  return (
    <div>
      <p>swaps</p>
      {swaps.map(swap => (
        <div key={swap._id}>{swap._id}</div>
      ))}
    </div>
  )
}

export async function getStaticProps() {
  const props = {}
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/swap`)
    if (res.status >= 400) {
      props.error = 'Bad request'
    } else {
      const json = await res.json()
      if (json.result) {
        props.swaps = json.result
      } else {
        props.error = json.error.message
      }
    }
  } catch (e) {
    console.warn(e)
    props.error = e.message
  }
  return { props, revalidate: 10 }
}
