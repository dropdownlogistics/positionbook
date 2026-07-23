export type Position = {
  id: string
  symbol: string
  strategy: string
  side: string
  status: string
  entryPrice: number
  exitPrice: number | null
  stopPrice: number | null
  shares: number | null
  entryDate: string
  exitDate: string | null
  rMultiple: number | null
  pctReturn: number | null
  dataQuality: string | null
  netPnl: number | null
  broker: string | null
  fees: number | null
  exitSignal: string | null
  contextNote: string | null
}
