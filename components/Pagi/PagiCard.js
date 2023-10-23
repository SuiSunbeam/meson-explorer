import Card, { CardTitle, CardBody } from 'components/Card'
import Table from 'components/Table'

import PagiList from './PagiList'

export default function PagiCard({ title, badge, subtitle, right, tabs, tableHeaders, Row, ...props }) {
  return (
    <Card>
      <CardTitle title={title} badge={badge} subtitle={subtitle} right={right} tabs={tabs} />
      <CardBody>
        <PagiList {...props}>
          <Table size='lg' headers={tableHeaders}>
            {list => list.map(row => <Row key={row._id} data={row} />)}
          </Table>
        </PagiList>
      </CardBody>
    </Card>
  )
}
