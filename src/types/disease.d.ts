export interface IDisease {
  name: string
  symptoms: string[]
  category: TCategory
  image?: string
}

export type TCategory =
'Internistisch' |
'Neurologisch' |
'Chirurgisch' |
'Traumata'
