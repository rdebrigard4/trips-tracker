export type ItemType = 'trip' | 'obligation'
export type Who = 'rich' | 'syd' | 'both'

export interface Item {
  id: string
  type: ItemType
  who: Who
  title: string
  startDate: string
  endDate?: string
  location?: string
  notes?: string
}
