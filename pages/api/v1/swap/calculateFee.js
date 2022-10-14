import mesonPresets from '@mesonfi/presets'
import { BigNumber, ethers } from 'ethers'
import { Rules, FeeWaives } from 'lib/db'

const fromValue = (value) => {
  return ethers.utils.formatUnits(value || '0', 6).replace(/\.0*$/, '')
}

const _matchNetworkToken = (rule, [n1, t1]) => {
  let n0, t0
  if (typeof rule === 'string') {
    n0 = rule.split(':')[0]
    t0 = rule.split(':')[1] || '*'
  } else {
    n0 = rule[0]
    t0 = rule[1]
  }
  if (n0 !== '*' && !n1.includes(n0)) {
    return false
  }
  if (typeof t0 === 'undefined' || t0 === '*' || t1.includes(t0)) {
    return true
  }
  return false
}

const matchSwapRule = (rules, { from, to }) => {
  if (!rules) {
    return
  }
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i]
    if (from[0] && _matchNetworkToken(rule.from, from) && _matchNetworkToken(rule.to, to)) {
      return rule
    }
  }
}

async function getSwapRules(initiator) {
  const rules = await Rules.find({ initiator: { $in: ['', initiator] } })
  .sort({ priority: -1 })
  .select('priority from to fee limit')
  .exec()
  if (initiator) {
    const date = new Date()
    date.setUTCHours(0, 0, 0, 0)
    const waived = await FeeWaives.findById(`${initiator.toLowerCase()}:${date.valueOf() / 1000}`)
    return { rules, waived: waived?.waived || 0, swaps: waived?.swaps || 0 }
  }
  return { rules }
}

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const supportedTokens = ['USDC', 'USDT', 'BUSD']
    const networkAlias = Object.fromEntries(Object.entries({
        Tron: 'TRX'
      }).map(([key, value]) => [value, key]))
    
      // NOTE: non-preminum address, just using for data query
    const address = '0x18d594bf5213a847c001775d8c4aac9427284774'
    const { token, inChain, outChain, amount: queryAmount } = req.query
    const inChainNetwork = networkAlias[inChain] ?? inChain
    const outChainNetwork = networkAlias[outChain] ?? outChain

    const tokenSymbol = token?.split('.')[0]
    if (!supportedTokens.includes(tokenSymbol)) {
      res.json({
        message: 'The swap route must has specific token.',
        code: 400
      })
    }

    if (queryAmount < 1) {
      res.json({
        message: `At least 1 ${tokenSymbol} needed`,
        code: 400
      })
    }

    const rulesInfo = await getSwapRules(address)
    const networks = mesonPresets.getAllNetworks()

    const fromNetwork = networks.find(item => item.name === inChainNetwork)
    const toNetwork = networks.find(item => item.name === outChainNetwork)

    if (!fromNetwork || !toNetwork) {
      return res.json({
        message: 'This swap route is not available',
        code: 400
      })
    }

    const fromSymbol = fromNetwork.tokens.find(item => item.symbol.startsWith(tokenSymbol))?.symbol
    const toSymbol = toNetwork.tokens.find(item => item.symbol.startsWith(tokenSymbol))?.symbol

    if (!toSymbol || !fromSymbol) {
      return res.json({
        message: 'This swap route is not available',
        code: 400
      })
    }

    const rule = matchSwapRule(rulesInfo.rules, {
      from: [fromNetwork.id, fromSymbol],
      to: [toNetwork.id, toSymbol]
    })

    if (rule.limit === 0) {
      return res.json({
        message: 'This swap route is not available',
        code: 400
      })
    }

    const value = ethers.utils.parseUnits(queryAmount || '0', 6)
    const amount = BigNumber.from(value)

    // non-premium
    const waiveServiceFee = rulesInfo.waived < 10000_000_000 && rulesInfo.swaps < 10
    let originalFee = amount.div(1000)
    let totalFee = waiveServiceFee ? BigNumber.from(0) : originalFee
    let lpFee = BigNumber.from(0)

    if (!rule || amount.eq(0)) {
      return res.json({
        data: {
          totalFee: Number(fromValue(totalFee)),
          originalFee: Number(fromValue(originalFee)),
          lpFee: Number(fromValue(lpFee)),
        },
        code: 200
      })
    }

    let indexFeeRule = 0
    while (indexFeeRule < rule.fee?.length) {
      const feeRule = rule.fee[indexFeeRule]
      if (feeRule.min && BigNumber.from(feeRule.min).mul(1e6).gt(amount)) {
        indexFeeRule++
        continue
      }
      const minLpFee = BigNumber.from(feeRule.base || 0)
      lpFee = amount.mul(typeof feeRule.rate === 'number' ? feeRule.rate : 1000).div(1e6)
      if (lpFee.lt(minLpFee)) {
        lpFee = minLpFee
      }
      originalFee = originalFee.add(lpFee)
      totalFee = totalFee.add(lpFee)
      break
    }
    
    return res.json({
      data: {
        totalFee: Number(fromValue(totalFee)),
        originalFee: Number(fromValue(originalFee)),
        lpFee: Number(fromValue(lpFee)),
      },
      code: 200
    })
  } else {
    res.status(404).send()
  }
}
