import { type BenefitItemProps } from '../../Blocks/Benefits/Benefits'
import InstantPayouts from '../../img/Benefits/instant-payouts.svg'
import LowFees from '../../img/Benefits/low-fees.svg'
import OnchainProvenance from '../../img/Benefits/onchain-provenance.svg'
import Permissionless from '../../img/Benefits/permissionless.svg'
import Privacy from '../../img/Benefits/privacy.svg'
import Royalties from '../../img/Benefits/royalties.svg'
import SecondaryMarket from '../../img/Benefits/secondary-market.svg'
import PerpetualStorage from '../../img/Benefits/storage.svg'
import TrueOwenership from '../../img/Benefits/true-ownership.svg'

export const BenefitsData: BenefitItemProps[] = [
  {
    icon: TrueOwenership,
    title: 'True ownership',
    text: 'By tokenizing files on the blockchain, users ensure indisputable rights and the uniqueness of each item. This decentralized approach allowing users to have full control over their digital goods.',
  },
  {
    icon: Privacy,
    title: '100% privacy',
    text: 'Every file is encrypted with a cryptographic key, granting exclusive access solely to the token holder, ensuring unmatched security for their digital assets.',
  },
  {
    icon: Permissionless,
    title: 'Fully permissionless',
    text: 'Our platform operates without gatekeepers, allowing users to tokenize, store, and transfer their files on the blockchain without any centralized authority, intermediaries, KYC, or prior moderation.',
  },
  {
    icon: OnchainProvenance,
    title: 'Onchain provenance',
    text: 'Every file\'s history and ownership are immutably recorded on the blockchain, offering transparent and verifiable traceability for users.',
  },
  {
    icon: SecondaryMarket,
    title: 'Secondary market',
    text: 'We offer an integrated trade-after-purchase platform, allowing immediate resale of digital goods where they were initially bought.',
  },
  {
    icon: Royalties,
    title: 'Royalties',
    text: 'We\'ve implemented a system where creators receive a percentage of sales every time their digital goods are resold, ensuring continuous compensation for their work.',
  },
  {
    icon: LowFees,
    title: 'Low fees',
    text: 'Our platform stands out with a mere 1% commission, making it one of the most cost-effective options for users compared to similar products',
  },
  {
    icon: InstantPayouts,
    title: 'Instant payouts',
    text: 'We enable sellers to receive their funds immediately with crypto payments inside your deals, ensuring maximum convenience for data traders regardless of geographical boundaries.',
  },
  {
    icon: PerpetualStorage,
    title: 'Perpetual decentralized storage',
    text: 'Your digital goods are securely stored, eliminating risks from centralized servers and data loss, ensuring they\'re inaccessible to unauthorized parties, but remain available for future generations.',
  },
]
