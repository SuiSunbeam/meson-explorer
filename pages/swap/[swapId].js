export default function Swap({ swap, error }) {
  if (error) {
    return <p>{error}</p>
  } else if (!swap) {
    return 'loading...'
  }
  return (
    <div>
      <p>id {swap._id}</p>
      <p>{swap.status}</p>
      <p>from {swap.inChain} {swap.inToken} {swap.initiator}</p>
      <p>to {swap.outChain} {swap.outToken} {swap.recipient}</p>
      <p>amount: {swap.amount}</p>
      <p>fee: {swap.fee}</p>
      <p>expire: {swap.expireTs}</p>
    </div>
  )
}

export async function getStaticProps({ params }) {
  const props = {}
  if (params.swapId) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/swap/${params.swapId}`)
      if (res.status >= 400) {
        props.error = 'Swap not found'
      } else {
        const json = await res.json()
        if (json.result) {
          props.swap = json.result
        } else {
          props.error = json.error.message
        }
      }
    } catch (e) {
      console.warn(e)
      props.error = e.message
    }
  } else {
    props.error = 'No swap id'
  }
  return { props, revalidate: 10 }
}

export async function getStaticPaths() {
  return { paths: [], fallback: true }
}
